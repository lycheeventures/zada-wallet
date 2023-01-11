import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import Config from 'react-native-config';
import QRCodeScanner from 'react-native-qrcode-scanner';
import CredValuesModal from './components/CredValuesModal';
import CustomProgressBar from './components/CustomProgressBar';
import ActionDialog from '../../components/Dialogs/ActionDialog';
import FailureModal from './components/FailureModal';
import SuccessModal from './components/SuccessModal';
import { useAppDispatch, useAppSelector } from '../../store';
import ConstantsList from '../../helpers/ConfigApp';
import { getType, handleCredVerification, handleQRConnectionRequest, handleQRLogin } from './utils';
import { CredentialAPI, VerificationAPI } from '../../gateways';
import { showAskDialog, showOKDialog, _showAlert } from '../../helpers/Toast';
import { selectConnections, selectConnectionsStatus } from '../../store/connections/selectors';
import { acceptConnection } from '../../store/connections/thunk';
import { addAction } from '../../store/actions';
import { selectAutoAcceptConnection, selectUser } from '../../store/auth/selectors';

const defaultCredState = { type: 'none', credentials: [] };

const QRScreen = ({ route, navigation }) => {
  //Constants
  const dispatch = useAppDispatch();

  // Selectors
  const connections = useAppSelector(selectConnections.selectAll);
  const connectionStatus = useAppSelector(selectConnectionsStatus);
  const auto_accept_connection = useAppSelector(selectAutoAcceptConnection);
  const user = useAppSelector(selectUser);

  // States
  const [scan, setScan] = useState(true);
  const [progress, setProgress] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('Fetching Details');
  const [values, setValues] = useState(null);
  const [credentialData, setCredentialData] = useState(defaultCredState);

  // For Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isScanning, setScanning] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // UseEffects
  // QR Scan Control.
  useEffect(() => {
    if (credentialData.type !== 'none') {
      setScan(false);
    } else {
      setScan(true);
    }
  }, [credentialData]);

  useEffect(() => {
    // Alert
    if (connectionStatus === 'succeeded') {
      showOKDialog('ZADA', 'Your connection is created successfully.', () => {});
      navigateToMainScreen();
    }
  }, [connectionStatus, navigateToMainScreen]);

  // Deeplink handling.
  useEffect(() => {
    if (route.params !== undefined) {
      setScan(false);
      const { request } = route.params;
      const qrJSON = JSON.stringify(request);
      _handleQRScan({ data: qrJSON }, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Functions
  // Navigation to main screen
  const navigateToMainScreen = useCallback(() => {
    setProgress(false);
    setDialogTitle('');
    setCredentialData(defaultCredState);
    navigation.navigate('MainScreen');
  }, [navigation]);

  // Handle verify button press.
  const _handleVerifyClick = async () => {
    try {
      setScanning(true);

      const result = await VerificationAPI.submit_cold_verification(
        credentialData.credentials.data,
        credentialData.credentials.signature,
        credentialData.credentials.tenantId,
        credentialData.credentials.keyVersion
      );

      if (result.data.success) {
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 500);
      } else {
        setErrMsg('Failed to validate credential');
        setTimeout(() => {
          setShowErrorModal(true);
        }, 500);
      }

      setScanning(false);
      setCredentialData(defaultCredState);
      setValues(null);
    } catch (error) {
      setErrMsg('Unable to verify credential');
      setScanning(false);
      setCredentialData(defaultCredState);
      setValues(null);
      setTimeout(() => {
        setShowErrorModal(true);
      }, 500);
    }
  };

  // Handle QR scan.
  const _handleQRScan = useCallback(
    async (e, isLink) => {
      try {
        if (!isLink) {
          let type = getType(e.data);

          // Connection Request
          if (type === 'connectionless_verification') {
            let res = await handleQRLogin(JSON.parse(e.data));
            setCredentialData({
              type: 'connectionless_verification',
              credentials: res.credential,
            });
            return;
          }

          // Credential Request
          if (type === 'cred_ver') {
            let credObj = await handleCredVerification(JSON.parse(e.data));
            if (credObj) {
              // Setting values
              setValues(credObj.sortedValues);
              setCredentialData({
                type: 'cred_ver',
                credentials: credObj.credential,
              });
              return;
            }
          }
        }

        // Connection request handling
        let qrJSON;
        try {
          qrJSON = JSON.parse(e.data);
        } catch (error) {
          let isUrl = e.data.startsWith('https://');
          if (isUrl) {
            //  Sending Link
            setScan(false);
            showAskDialog(
              'ZADA',
              'Do you want to receive this as credential?',
              async () => {
                let resp = await CredentialAPI.submit_url_scheme(e.data, user.phone);
                if (resp.data.success) {
                  showOKDialog('ZADA', 'You will receive credential soon!', navigateToMainScreen);
                  return;
                } else {
                  navigateToMainScreen();
                  throw 'Not a valid ZADA QR';
                }
              },
              navigateToMainScreen
            );
            return;
          } else {
            navigateToMainScreen();
            throw 'Not a valid ZADA QR';
          }
        }

        if (qrJSON.type === ConstantsList.CONN_REQ) {
          if (
            Config.API_URL === 'https://test-agency.zadanetwork.com' &&
            qrJSON.env === 'production'
          ) {
            throw 'You are trying to scan production QR code with test app!';
          }
          if (
            Config.API_URL === 'https://agency.zadanetwork.com' &&
            (qrJSON.env === 'debug' || qrJSON.env === 'test')
          ) {
            throw 'You are trying to scan test QR code with production app!';
          }
          setDialogTitle('Fetching Connection Details');
          setScan(false);
          setProgress(true);

          let data = await handleQRConnectionRequest(qrJSON.metadata, qrJSON);

          let connectionExists = connections.find((x) => x.name === data.organizationName);
          if (connectionExists) {
            showOKDialog(
              'ZADA',
              'Connection with ' + data.organizationName + ' has already been created',
              navigateToMainScreen
            );
            return;
          }

          // Make a new connection
          // Check auto_acceptance from local storage

          if (!auto_accept_connection) {
            dispatch(addAction(qrJSON));
            navigateToMainScreen();
            return;
          }

          // Add to action if auto_accept_connection is false
          setDialogTitle('Accepting Connection...');

          // Accept Connection
          dispatch(acceptConnection(qrJSON.metadata));
        }
      } catch (error) {
        _showAlert('ZADA Wallet', error);
        navigateToMainScreen();
        console.log(error);
      }
    },
    [auto_accept_connection, connections, dispatch, navigateToMainScreen]
  );

  // Accept modal handler
  const acceptModal = async (e) => {
    setTimeout(() => {
      setProgress(true);
      setDialogTitle('Submitting Verification...');
    }, 500);

    setCredentialData({
      ...credentialData,
      type: 'temp',
    });

    try {
      // Submitting verification
      await VerificationAPI.submit_verification_connectionless(
        e.metadata,
        e.policyName,
        e.credentialId
      );

      console.log('setting progress to false!');
      setProgress(false);
      setCredentialData(defaultCredState);
      showOKDialog('ZADA', 'Submitted Successfully!', navigateToMainScreen);
      navigation.goBack();
    } catch (error) {
      setScanning(false);
      setProgress(false);
      setCredentialData(defaultCredState);
      setErrMsg('Unable to verify credential');
      setTimeout(() => {
        setShowErrorModal(true);
      }, 500);
    }
  };

  // On dimiss pressed
  const dismissModal = () => {
    setScan(true);
    setCredentialData(defaultCredState);
  };
  // On reject pressed
  const rejectModal = () => {
    navigation.goBack();
    setCredentialData(defaultCredState);
  };

  return (
    <View style={styles.mainContainer}>
      <CredValuesModal
        values={values}
        isVisible={values !== null}
        heading={isScanning ? 'Verifying...' : 'Credential\nInformation'}
        isScanning={isScanning}
        onCloseClick={() => {
          setScan(true);
          setValues(null);
          setCredentialData(defaultCredState);
        }}
        onVerifyPress={_handleVerifyClick}
      />

      {credentialData.type === 'connectionless_verification' && (
        <ActionDialog
          isVisible={credentialData.type === 'connectionless_verification'}
          rejectModal={rejectModal}
          data={credentialData.credentials}
          dismissModal={dismissModal}
          acceptModal={acceptModal}
          modalType="action"
          isIconVisible={true}
        />
      )}

      {/* On verification success */}
      <SuccessModal
        isVisible={showSuccessModal}
        heading="Success"
        info="Credential is verified successfully"
        onCloseClick={() => {
          setShowSuccessModal(false);
        }}
        onOkayPress={() => {
          setShowSuccessModal(false);
          setScan(true);
        }}
      />

      {/* On verification failure */}
      <FailureModal
        isVisible={showErrorModal}
        heading="Invalid Credential"
        info={errMsg}
        onCloseClick={() => {
          setShowErrorModal(false);
        }}
        onOkayPress={() => {
          setShowErrorModal(false);
          setScan(true);
        }}
      />

      {scan ? (
        <QRCodeScanner
          reactivate={true}
          showMarker={true}
          reactivateTimeout={1000}
          customMarker={
            <View style={styles.customMarkerViewStyle}>
              <View style={styles.customMarkerInnerViewStyle} />
            </View>
          }
          onRead={_handleQRScan}
          topContent={<Text style={styles.textBold}>Point your camera to a QR code to scan</Text>}
          bottomContent={
            <TouchableOpacity style={styles.buttonTouchable} onPress={navigateToMainScreen}>
              <Text style={styles.buttonText}>Cancel Scan</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        progress && (
          <View style={styles.progressViewStyle}>
            <CustomProgressBar isVisible={true} text={dialogTitle} />
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBold: {
    fontSize: 20,
    marginLeft: 70,
    marginRight: 70,
    zIndex: 10,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
    color: '#fff',
  },
  buttonText: {
    fontSize: 21,
    color: '#4178CD',
  },
  buttonTouchable: {
    padding: 16,
  },
  customMarkerViewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  customMarkerInnerViewStyle: {
    height: 250,
    width: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  progressViewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default QRScreen;
