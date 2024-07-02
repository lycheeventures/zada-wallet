import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Linking } from 'react-native';
import Config from 'react-native-config';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useTranslation } from 'react-i18next';
import CredValuesModal from './components/CredValuesModal';
import CustomProgressBar from './components/CustomProgressBar';
import ActionDialog from '../../components/Dialogs/ActionDialog';
import FailureModal from './components/FailureModal';
import SuccessModal from './components/SuccessModal';
import { useAppDispatch, useAppSelector } from '../../store';
import ConstantsList from '../../helpers/ConfigApp';
import {
  getType,
  handleCredVerification,
  handleQRConnectionRequest,
  makeVerificationObject,
} from './utils';
import { CredentialAPI, VerificationAPI } from '../../gateways';
import { showAskDialog, showNetworkMessage, showOKDialog, _showAlert } from '../../helpers/Toast';
import { selectConnections, selectConnectionsStatus } from '../../store/connections/selectors';
import { acceptConnection } from '../../store/connections/thunk';
import { addAction } from '../../store/actions';
import { selectAutoAcceptConnection, selectUser } from '../../store/auth/selectors';
import { selectNetworkStatus } from '../../store/app/selectors';
import { convertStringToBase64 } from '../../helpers/utils';
import { clearAllAndLogout } from '../../store/utils';
import { addConnection } from '../../store/connections';

const defaultCredState = { type: 'none', credentials: [] };

const QRScreen = ({ route, navigation }) => {
  //Constants
  const dispatch = useAppDispatch();

  // Selectors
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const connections = useAppSelector(selectConnections.selectAll);
  const connectionStatus = useAppSelector(selectConnectionsStatus);
  const auto_accept_connection = useAppSelector(selectAutoAcceptConnection);
  const networkStatus = useAppSelector(selectNetworkStatus);

  // States
  const [scan, setScan] = useState(true);
  const [progress, setProgress] = useState(false);
  const [dialogTitle, setDialogTitle] = useState(t('messages.fetching_detail'));
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
      showOKDialog('ZADA', t('messages.success_connection'), () => { });
      navigateToMainScreen();
    }
  }, [connectionStatus, navigateToMainScreen]);

  // Deeplink handling.
  useEffect(() => {
    if (route.params !== undefined) {
      setScan(false);
      const { request, isLink } = route.params;
      const qrJSON = JSON.stringify(request);
      _handleQRScan({ data: qrJSON }, isLink);
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
        // Return if internet is unavailable
        if (networkStatus === 'disconnected') {
          showNetworkMessage();
          navigateToMainScreen();
          return;
        }

        if (!isLink) {
          let type = getType(e.data);
          let credObj = {};

          if (type.startsWith('zada://') || type.startsWith('zada://network')) {
            type = type.split('/')[3];
          }
          switch (type) {
            // handling connectionless verification
            case 'connectionless-verification':
              try {
                setScan(false);
                setProgress(true);
                setDialogTitle('Please wait...');

                let parsedData = JSON.parse(e.data);
                if (parsedData.data === undefined) {
                  parsedData = convertStringToBase64(JSON.stringify(parsedData));
                } else {
                  parsedData = parsedData.data
                }
                let result = await VerificationAPI.send_request_to_agency(parsedData);
                if (result.data.success) {
                  let res = await makeVerificationObject(result.data.verification);
                  setCredentialData({
                    type: 'connectionless-verification',
                    credentials: res.credential,
                  });
                }

                setScan(false);
                setProgress(false);
                setDialogTitle('');
              } catch (err) {
                throw 'Not a valid ZADA QR';
              }
              return;

            // handling credential verification for v1 & v2 QR
            case 'cred_ver':
              try {
                credObj = await handleCredVerification(JSON.parse(e.data));
                if (credObj) {
                  // Setting values
                  setValues(credObj.sortedValues);
                  setCredentialData({
                    type: 'cred_ver',
                    credentials: credObj.credential,
                  });
                }
              } catch (err) {
                throw 'Not a valid ZADA QR';
              }
              return;

            // handling credential verification for v3 QR
            case 'cv':
              try {
                credObj = await handleCredVerification(JSON.parse(e.data));
                if (credObj) {
                  // Setting values
                  setValues(credObj.sortedValues);
                  setCredentialData({
                    type: 'cred_ver',
                    credentials: credObj.credential,
                  });
                }
              } catch (err) {
                throw 'Not a valid ZADA QR';
              }
              return;
            default:
              console.log('Case not supported!');
          }
        }

        // Connection request handling
        let qrJSON;
        try {
          qrJSON = JSON.parse(e.data);
        } catch (error) {
          let isUrl = e.data.startsWith('https://');
          if (isUrl) {
            setScan(false);
            /// check if user.phone is available  or not and if not then show dialog to re-login the app.
            if (!user.phone) {
              showAskDialog(
                'ZADA',
                'You need to re-login the app to continue!',
                () => {
                  dispatch(clearAllAndLogout());
                },
                navigateToMainScreen,
                'logout'
              );
              return;
            }
            // Sending Link
            showAskDialog(
              'ZADA',
              'Do you want to receive this as credential?',
              async () => {
                setScan(false);
                setProgress(true);
                setDialogTitle('Please wait...');
                let resp = await CredentialAPI.submit_url_scheme(e.data, user.phone);
                if (resp.data.success) {
                  // create connection if not exists
                  if (resp.data.connection) {
                    dispatch(addConnection(resp.data.connection));
                  }
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
        if (error?.response?.status === 404) {
          console.log('error');
        } else {
          _showAlert('ZADA Wallet', error);
        }
        navigateToMainScreen();
      }
    },
    [auto_accept_connection, connections, dispatch, navigateToMainScreen, networkStatus]
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

    // Handle metadata as JSON
    let metadata = undefined;
    let redirectCallback = undefined;
    if (typeof e.metadata === 'object') {
      metadata = e.metadata.verificationRequestId;
      redirectCallback = e.metadata.redirectCallback;
    } else {
      metadata = e.metadata;
    }

    try {
      // Submitting verification
      await VerificationAPI.submit_verification_connectionless(
        metadata,
        e.policyName,
        e.credentialId,
      );

      setProgress(false);
      setCredentialData(defaultCredState);
      if (redirectCallback != undefined && redirectCallback != '') {
        Linking.openURL(redirectCallback);
      } else {
        showOKDialog('ZADA', 'Submitted Successfully!', navigateToMainScreen);
      }
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

      {credentialData.type === 'connectionless-verification' && (
        <ActionDialog
          isVisible={credentialData.type === 'connectionless-verification'}
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
          topContent={<Text style={styles.textBold}>{t("QRScreen.title")}</Text>}
          bottomContent={
            <TouchableOpacity style={styles.buttonTouchable} onPress={navigateToMainScreen}>
              <Text style={styles.buttonText}>{t('QRScreen.cancel_scan')}</Text>
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
