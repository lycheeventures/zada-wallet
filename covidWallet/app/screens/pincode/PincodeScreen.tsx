import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Alert,
  SafeAreaView,
} from 'react-native';
import { AppColors, RED_COLOR } from '../../theme/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
interface IProps {
  isVisible?: boolean;
  onDismiss?: () => void;
  onPincodeChange?: (text: string) => void;
  pincode?: string;
  pincodeError?: string;
  onConfirmPincodeChange: (text: string) => void;
  confirmPincode: string;
  confirmPincodeError: string;
  savePincode: () => void;
  isVerifyPin?: boolean; // pass this when using this screen to authorize user,
  onBiometricSuccess?: () => void;
}

const PincodeScreen = ({
  pincode,
  onPincodeChange,
  onDismiss,
  isVisible,
  pincodeError,
  confirmPincode,
  onConfirmPincodeChange,
  savePincode,
  isVerifyPin,
  confirmPincodeError,
  onBiometricSuccess
}: IProps) => {

  // states
  const [isVerify, setIsVerify] = useState(!!isVerifyPin);
  const animateLeftValue = useState(new Animated.Value(0))[0];
  const animateOpacity = useState(new Animated.Value(1))[0];

  const { t } = useTranslation();

  const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

  useEffect(() => {
    if (pincode?.length === 6 && !pincodeError) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(animateLeftValue, {
            toValue: -500, // Move out of the screen to the left
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(animateOpacity, {
            toValue: 0, // Fade out
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ]),
      ]).start(() => {
        setIsVerify(true);

        // Reset animation values
        animateLeftValue.setValue(500); // Move out of the screen to the right
        animateOpacity.setValue(0); // Fully transparent

        // Animate back to visible
        Animated.parallel([
          Animated.timing(animateLeftValue, {
            toValue: 0, // Move into the screen from the right
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(animateOpacity, {
            toValue: 1, // Fade in
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ]).start();
      });
    }
  }, [pincode]);


  useEffect(() => {
    // reset pin if there is any error
    if (pincodeError && onPincodeChange) {
      onPincodeChange("");
    }
    if (confirmPincodeError) {
      onConfirmPincodeChange("")
    }
  }, [pincodeError, confirmPincodeError]);

  useEffect(() => {
    // when confirm pincode is correct, save the pin code
    if (confirmPincode.length === 6 && !confirmPincodeError) {
      savePincode();
    }
  }, [confirmPincode]);

  useEffect(() => {
    if (isVerifyPin) {
      isBiometricAvailable();
    }
  }, [])

  const handleBiometricAuth = async () => {
    try {
      const resultObject = await rnBiometrics.simplePrompt({ promptMessage: 'Authenticate' });
      const { success } = resultObject;
      if (success) {
        onConfirmPincodeChange("");
        return true;
      } else {
        return false;
      }
    } catch {
      Alert.alert('Biometric Authentication', 'Biometrics not supported or error occurred');
      return false;
    }
  };

  //Biometric funciton
  const isBiometricAvailable = async () => {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    if (
      (biometryType === BiometryTypes.FaceID ||
        biometryType === BiometryTypes.Biometrics ||
        biometryType === BiometryTypes.TouchID) &&
      available
    ) {
      let result = await handleBiometricAuth();
      if (result && onBiometricSuccess) {
        onBiometricSuccess();
      }
    }
  };

  const handleKeyPress = (key: string) => {
    if (onPincodeChange) {
      if (key === 'biometric') return;
      if (key === 'delete') {
        onPincodeChange(pincode!.slice(0, -1));
      } else if (pincode!.length < 6) {
        onPincodeChange(pincode + key);
      }
    }
  };

  const handleConfirmModalKeyPress = (key: string) => {
    if (key === 'biometric' && isVerifyPin) {
      isBiometricAvailable();
      return;
    } else if (key === 'biometric') return;
    if (key === 'delete') {
      onConfirmPincodeChange(confirmPincode.slice(0, -1));
    } else if (confirmPincode.length < 6) {
      onConfirmPincodeChange(confirmPincode + key);
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

  const handleBackFromConfirmPinScreen = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(animateLeftValue, {
          toValue: 500, // Move out of the screen to the right
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animateOpacity, {
          toValue: 0, // Fade out
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      onPincodeChange && onPincodeChange("");
      onConfirmPincodeChange("");
      setIsVerify(false);
      // Reset animations after the state change
      animateLeftValue.setValue(-500); // Move out of the screen to the left
      animateOpacity.setValue(0); // Fully transparent

      // Animate back to visible
      Animated.parallel([
        Animated.timing(animateLeftValue, {
          toValue: 0, // Move into the screen from the left
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animateOpacity, {
          toValue: 1, // Fade in
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]).start();
    });
  }


  const NumericKeyboard = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'biometric', '0', 'delete'];

    return (
      <View style={styles.keyboardContainer}>
        {keys.map(key => (
          <TouchableOpacity
            key={key}
            style={styles.key}
            onPress={() => (isVerify ? handleConfirmModalKeyPress(key) : handleKeyPress(key))}>
            <Text style={styles.keyText}>
              {key === 'biometric' ? (
                !isVerifyPin ? <></> : <MaterialCommunityIcons name="fingerprint" size={35} />
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

  const PincodeModal = () => {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[styles.container, { left: animateLeftValue, opacity: animateOpacity }]}>
          <Image
            source={require('../../assets/images/lock.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>{t('PincodeScreen.title')}</Text>
          <Text style={styles.subTitle}>{t('PincodeScreen.sub_title')}</Text>
          <PinInput pin={pincode ?? ""} />
          {pincodeError && (
            <View style={{ height: 20, justifyContent: 'center' }}>
              <Text style={styles.errorStyle}>{pincodeError}</Text>
            </View>
          )}
          <NumericKeyboard />
        </Animated.View>
      </SafeAreaView>
    )
  }

  const VerifyPincodeModal = () => {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[styles.container, { left: animateLeftValue, opacity: animateOpacity }]}>
          <TouchableOpacity
            style={styles.backIconStyle}
            onPress={isVerifyPin ? onDismiss : handleBackFromConfirmPinScreen}>
            <MaterialCommunityIcons name="arrow-left" size={30} color="#FFF" />
          </TouchableOpacity>
          <Image
            source={require('../../assets/images/lock.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>{isVerifyPin ? "VERIFY" : t('PincodeScreen.confirm_pin_title')}</Text>
          <Text style={styles.subTitle}>{isVerifyPin ? "Please enter your 6 digit pincode to verify request" : t('PincodeScreen.confirm_pin_sub_title')}</Text>
          <PinInput pin={confirmPincode} />
          <NumericKeyboard />
        </Animated.View>
      </SafeAreaView>
    )
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onDismiss={onDismiss}>
      <View style={{
        backgroundColor: AppColors.PRIMARY,
        flex: 1
      }}>
        {isVerify ?
          <VerifyPincodeModal />
          : <PincodeModal />
        }
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
    top: 20,
    left: 30,
    padding: 10,
  },
  logo: {
    width: 100,
    marginTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    color: '#FFF',
    marginTop: 20,
  },
  subTitle: {
    flex: 1,
    paddingHorizontal: 20,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: AppColors.WHITE,
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
  errorStyle: {
    color: RED_COLOR,
    fontSize: 10,
    paddingLeft: 24,
    paddingRight: 16,
  },
});

export default PincodeScreen;
