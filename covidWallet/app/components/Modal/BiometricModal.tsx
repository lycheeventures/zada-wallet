import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  AppState,
  Platform,
} from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { useTranslation } from 'react-i18next';
import { AppColors } from '../../theme/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getItemFromLocalStorage, saveItemInLocalStorage } from '../../helpers';
import { BIOMETRIC_ENABLED, BIOMETRIC_IN_PROGRESS } from '../../helpers/ConfigApp';
import ConstantsList from '../../helpers/ConfigApp';

interface IProps {
  appStarted?: React.MutableRefObject<boolean>;
  oneTimeAuthentication?: boolean;
  isVisible?: boolean;
  onDismiss?: () => void;
  onSuccess?: (e: boolean) => void;
}

const BiometricModal = (props: IProps) => {
  // Hooks
  const { t } = useTranslation();

  // Constants
  const appState = useRef(AppState.currentState);

  // States
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState(''); // This should be securely stored and retrieved
  const [authStatus, setAuthStatus] = useState(true);
  const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

  useEffect(() => {
    if (!props.oneTimeAuthentication) {
      const subscription = AppState.addEventListener('change', async nextAppState => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          let isBiometricInProgress = await getItemFromLocalStorage(BIOMETRIC_IN_PROGRESS);
          if (isBiometricInProgress) {
            return;
          }
          checkIfAuthIsRequired();
        } else {
          if (Platform.OS === 'android') {
            saveItemInLocalStorage(BIOMETRIC_IN_PROGRESS, false);
          }
        }

        appState.current = nextAppState;
      });
      return () => {
        subscription.remove();
      };
    } else {
      isBiometricAvailable();
    }
  }, []);

  // When app starts
  useEffect(() => {
    if (props.appStarted?.current) {
      checkIfAuthIsRequired();
    }
  }, []);

  useEffect(() => {
    const setPinFromLocalStorage = async () => {
      const pin = await getItemFromLocalStorage(ConstantsList.PIN_CODE);
      if (pin) {
        setStoredPin(pin);
      }
    };
    setPinFromLocalStorage();
  }, [authStatus]);

  // When pin is entered
  useEffect(() => {
    if (pin.length === 6)
      setTimeout(() => {
        handlePinAuth();
      }, 100); // Adding a slight delay to allow the last digit to be updated in the state
  }, [pin]);

  const checkIfAuthIsRequired = async () => {
    const isBiometricEnabled = await getItemFromLocalStorage(BIOMETRIC_ENABLED);
    if (isBiometricEnabled) {
      setAuthStatus(false);
      await isBiometricAvailable();
    } else {
      setAuthStatus(true);
    }
    if (props.appStarted?.current) {
      props.appStarted.current = false;
    }
  };

  const isBiometricAvailable = async (isManualPress?: boolean) => {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    if (
      (biometryType === BiometryTypes.FaceID ||
        biometryType === BiometryTypes.Biometrics ||
        biometryType === BiometryTypes.TouchID) &&
      available
    ) {
      await saveItemInLocalStorage(BIOMETRIC_IN_PROGRESS, true);
      let result = await handleBiometricAuth();
      if (result && props.onSuccess && props.oneTimeAuthentication) {
        props.onSuccess(result);
      }
    } else {
      if (isManualPress) {
        Alert.alert(t('errors.biometric_heading'), t('errors.biometric_not_supported'));
      }
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const resultObject = await rnBiometrics.simplePrompt({ promptMessage: 'Authenticate' });
      const { success } = resultObject;
      if (success) {
        setAuthStatus(true);
        // Reset pin
        setPin('');
        if (Platform.OS === 'ios') {
          setTimeout(() => {
            saveItemInLocalStorage(BIOMETRIC_IN_PROGRESS, false);
          }, 2000);
        }
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  const handlePinAuth = () => {
    if (pin === storedPin.toString()) {
      setAuthStatus(true);
      if (props.oneTimeAuthentication) {
        if (props.onSuccess) {
          props.onSuccess(true);
        }
      }
      // Reset pin
      setPin('');
      saveItemInLocalStorage(BIOMETRIC_IN_PROGRESS, false);
      return true;
    } else {
      Alert.alert('PIN Authentication', 'Incorrect PIN');
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      setPin(pin.slice(0, -1));
    } else if (pin.length < 6) {
      setPin(pin + key);
    }
  };

  const PinInput = ({ pin }: { pin: string }) => {
    return (
      <View style={styles.pinContainer}>
        {Array(6)
          .fill('')
          .map((_, index) => (
            <View key={index} style={styles.pinInput}>
              <Text style={styles.pinText}>{pin[index] ? '•' : ''}</Text>
            </View>
          ))}
      </View>
    );
  };

  const NumericKeyboard = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'biometric', '0', 'delete'];

    return (
      <View style={styles.keyboardContainer}>
        {keys.map(key => (
          <TouchableOpacity
            key={key}
            style={styles.key}
            onPress={() =>
              key === 'biometric' ? isBiometricAvailable(true) : handleKeyPress(key)
            }>
            <Text style={styles.keyText}>
              {key === 'biometric' ? (
                <MaterialCommunityIcons name="fingerprint" size={35} />
              ) : key === 'delete' ? (
                '⌫'
              ) : (
                key
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.oneTimeAuthentication ? props.isVisible : !authStatus}
      onDismiss={props.onDismiss}>
      <View style={styles.container}>
        {props.oneTimeAuthentication && (
          <TouchableOpacity
            style={styles.backIconStyle}
            onPress={() => {
              saveItemInLocalStorage(BIOMETRIC_IN_PROGRESS, false);
              props.onDismiss && props.onDismiss();
            }}>
            <MaterialCommunityIcons name="arrow-left" size={30} color="#FFF" />
          </TouchableOpacity>
        )}
        <Image source={require('../../assets/gifs/launch_screen_logo.gif')} style={styles.logo} />
        <Text style={styles.title}>Enter your login PIN</Text>
        <PinInput pin={pin} />
        <NumericKeyboard />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: AppColors.PRIMARY,
  },
  backIconStyle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 30,
    padding: 10,
  },
  logo: {
    width: 100,
    height: 50,
    marginTop: 100,
  },
  title: {
    flex: 2,
    fontSize: 20,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    color: '#FFF',
  },
  pinContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pinInput: {
    width: 20,
    height: 50,
    borderBottomWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pinText: {
    fontSize: 24,
    color: '#FFF',
  },
  forgotPin: {
    color: '#FFF',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  keyboardContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  key: {
    width: '25%',
    padding: 20,
    margin: 5,
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    color: '#FFF',
  },
});

export default BiometricModal;
