import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Linking, Dimensions } from 'react-native';
//import QRCodeScanner from 'react-native-qrcode-scanner';
import { useTranslation } from 'react-i18next';
import CredValuesModal from './components/CredValuesModal';
import CustomProgressBar from './components/CustomProgressBar';
import FailureModal from './components/FailureModal';
import SuccessModal from './components/SuccessModal';
import { useAppDispatch, useAppSelector } from '../../store';
import ConstantsList from '../../helpers/ConfigApp';
import {
  getType,
  handleCredVerification,
  getConnectionDetails,
  makeVerificationObject,
} from './utils';
import { CredentialAPI, VerificationAPI } from '../../gateways';
import { showAskDialog, showNetworkMessage, showOKDialog, _showAlert } from '../../helpers/Toast';
import { selectConnections, selectConnectionsStatus } from '../../store/connections/selectors';
import { acceptConnection } from '../../store/connections/thunk';
import { addAction } from '../../store/actions';
import { selectAutoAcceptConnection, selectUser } from '../../store/auth/selectors';
import { selectBaseUrl, selectNetworkStatus } from '../../store/app/selectors';
import { convertStringToBase64 } from '../../helpers/utils';
import { clearAllAndLogout } from '../../store/utils';
import { addConnection } from '../../store/connections';
import VerificationRequestScreen from '../verification_request_screen/VerificationRequestScreen';
import ErrorHandler from '../../components/Error/ErrorHandler';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { AppColors } from '../../theme/Colors';
const { width, height } = Dimensions.get('window');
const FRAME_SIZE = 300;

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
  const API_URL = useAppSelector(selectBaseUrl);

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

  // camera
  const [cameraActive, setCameraActive] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const device = useCameraDevice('back');

  // Request camera permission
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        setTimeout(() => {
          showOKDialog(
            'Permission Denied',
            'Please allow camera access in ZADA app info to continue.',
            navigateToMainScreen
          );
        }, 500);
      }
    })();
  }, []);

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
      showOKDialog('ZADA', t('messages.success_connection'), () => {});
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

  // QR code scanner
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && cameraActive) {
        const value = codes[0]?.value;
        if (value) {
          _handleQRScan({ data: value }, false);
          setCameraActive(false);
        }
      }
    },
  });

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
                let connectionId = undefined;
                if (parsedData.data === undefined) {
                  // Adding connectionId to support connection creation during connectionless-verification
                  connectionId = parsedData.metadata.connectionId;
                  parsedData = convertStringToBase64(JSON.stringify(parsedData));
                } else {
                  parsedData = parsedData.data;
                }
                let result = await VerificationAPI.send_request_to_agency(parsedData);
                if (result.data.success) {
                  let res = await makeVerificationObject(result.data.verification);
                  setTimeout(() => {
                    setCredentialData({
                      type: 'connectionless-verification',
                      credentials: { ...res.credential, connectionId },
                    });
                  }, 500);
                }

                setScan(false);
                setProgress(false);
                setDialogTitle('');
              } catch (err) {
                throw ErrorHandler(err, t);
              }
              return;

            // handling credential verification for v1 & v2 QR
            case 'cred_ver':
              try {
                credObj = await handleCredVerification(JSON.parse(e.data));
                if (credObj) {
                  // Setting values
                  setValues(credObj.sortedValues);
                  setTimeout(() => {
                    setCredentialData({
                      type: 'cred_ver',
                      credentials: credObj.credential,
                    });
                  }, 500);
                }
              } catch (err) {
                throw ErrorHandler(err, t);
              }
              return;

            // handling credential verification for v3 QR
            case 'cv':
              try {
                credObj = await handleCredVerification(JSON.parse(e.data));
                if (credObj) {
                  // Setting values
                  setValues(credObj.sortedValues);
                  setTimeout(() => {
                    setCredentialData({
                      type: 'cred_ver',
                      credentials: credObj.credential,
                    });
                  }, 500);
                }
              } catch (err) {
                throw ErrorHandler(err, t);
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
          if (API_URL === 'https://test-agency.zadanetwork.com' && qrJSON.env === 'production') {
            throw 'You are trying to scan production QR code with test app!';
          }
          if (
            API_URL === 'https://agency.zadanetwork.com' &&
            (qrJSON.env === 'debug' || qrJSON.env === 'test')
          ) {
            throw 'You are trying to scan test QR code with production app!';
          }
          setDialogTitle('Fetching Connection Details');
          setScan(false);
          setProgress(true);

          let data = await getConnectionDetails(qrJSON.metadata, qrJSON);

          let connectionExists = connections.find(x => x.name === data.organizationName);
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

  if (!hasPermission)
    return (
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Waiting for camera permission...</Text>
      </View>
    );
  if (!device)
    return (
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Your centered text</Text>
      </View>
    );

  return (
    <View style={styles.mainContainer}>
      <CredValuesModal
        values={values}
        isVisible={values !== null}
        heading={isScanning ? 'Verifying...' : 'Credential\nInformation'}
        isScanning={isScanning}
        onCloseClick={() => {
          setValues(null);
          setTimeout(() => {
            navigateToMainScreen();
          }, 300);
        }}
        onVerifyPress={_handleVerifyClick}
      />

      {credentialData.type === 'connectionless-verification' && (
        <VerificationRequestScreen data={credentialData.credentials} />
      )}

      {/* On verification success */}
      <SuccessModal
        isVisible={showSuccessModal}
        heading="Success"
        info="Credential is verified successfully"
        onCloseClick={() => {
          setShowSuccessModal(false);
          setTimeout(() => {
            navigateToMainScreen();
          }, 300);
        }}
        onOkayPress={() => {
          setShowSuccessModal(false);
          setTimeout(() => {
            navigateToMainScreen();
          }, 300);
        }}
      />

      {/* On verification failure */}
      <FailureModal
        isVisible={showErrorModal}
        heading="Invalid Credential"
        info={errMsg}
        onCloseClick={() => {
          setShowErrorModal(false);
          setTimeout(() => {
            navigateToMainScreen();
          }, 300);
        }}
        onOkayPress={() => {
          setShowErrorModal(false);
          setTimeout(() => {
            navigateToMainScreen();
          }, 300);
        }}
      />

      {scan && cameraActive && (
        <View style={styles.container}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={cameraActive}
            codeScanner={codeScanner}
          />

          <View style={styles.overlay}>
            <View style={styles.topOverlay} />
            <Text style={styles.title}>{t('QRScreen.title')}</Text>
            <View style={styles.middleRow}>
              <View style={styles.sideOverlay} />
              <View style={styles.frame} />
              <View style={styles.sideOverlay} />
            </View>
            <View style={styles.bottomOverlay}>
              <TouchableOpacity style={styles.button} onPress={navigateToMainScreen}>
                <Text style={styles.buttonText}>{t('QRScreen.cancel_scan')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {progress && (
        <View style={styles.progressViewStyle}>
          <CustomProgressBar isVisible={true} text={dialogTitle} />
        </View>
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
  container: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    width,
    height,
    justifyContent: 'space-between',
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  middleRow: {
    flexDirection: 'row',
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: 2,
    borderColor: AppColors.WHITE,
    borderRadius: 8,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: AppColors.WHITE,
    zIndex: 10,
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    fontWeight: '600',
    color: AppColors.BLACK,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressViewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default QRScreen;
