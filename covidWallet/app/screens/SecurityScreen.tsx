import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import { BACKGROUND_COLOR } from '../theme/Colors';
import { AuthStackParamList } from '../navigation/types';
import ImageBoxComponent from '../components/ImageBoxComponent';
import TextComponent from '../components/TextComponent';
import GreenPrimaryButton from '../components/GreenPrimaryButton';
import PincodeModal from '../components/Modal/PincodeModal';
import { pincodeRegex } from '../helpers/validation';
import { showMessage } from '../helpers/Toast';
import { saveItem } from '../helpers/Storage';
import ConstantsList from '../helpers/ConfigApp';
import { useTranslation } from 'react-i18next';

const img = require('../assets/images/security.png');

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}
const SecurityScreen = (props: INProps) => {
  // Selectors
  const { t } = useTranslation();

  // Constants
  const navigation = props.navigation;

  // States
  const [isSensorAvailable, checkSensor] = useState(false);
  const [isSuccessful, checkSecureIDAuth] = useState(false);

  // For Pincode
  const [showPincodeModal, setShowPinCodeModal] = useState(false);
  const [isPincodeSet, setIsPincode] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [confirmPincode, setConfirmPincode] = useState('');
  const [confirmPincodeError, setConfirmPincodeError] = useState('');

  useEffect(() => {
    isSecureIDAvailable();
  }, []);

  function enableSecureID() {
    if (isSensorAvailable) {
      if (Platform.OS === 'ios') {
        FingerprintScanner.authenticate({
          description: 'Scan your fingerprint on the device scanner to continue',
        })
          .then(() => {
            checkSecureIDAuth(true);
            setShowPinCodeModal(true);
          })
          .catch(error => {
            setShowPinCodeModal(true);
          });
      } else {
        if (requiresLegacyAuthentication()) {
          authLegacy();
        } else {
          authCurrent();
        }
      }
    } else {
      //Open Pincode modal the SecureID Process if Sensor not Available
      setShowPinCodeModal(true);
    }
  }

  function requiresLegacyAuthentication() {
    return Platform.Version < '23';
  }

  function isSecureIDAvailable() {
    FingerprintScanner.isSensorAvailable()
      .then(() => {
        checkSensor(true);
      })
      .catch(error => {
        checkSensor(false);
      });
  }

  function authLegacy() {
    FingerprintScanner.release();
    FingerprintScanner.authenticate({
      title: 'Log in with Secure ID to continue',
    })
      .then(() => {
        FingerprintScanner.release();
        checkSecureIDAuth(true);
        //set OTP also
        setShowPinCodeModal(true);
      })
      .catch(error => {
        //set OTP also
        FingerprintScanner.release();
        setShowPinCodeModal(true);
        checkSecureIDAuth(false);
      });
  }

  function authCurrent() {
    FingerprintScanner.release();
    FingerprintScanner.authenticate({
      title: 'Log in with Secure ID to continue',
    })
      .then(() => {
        FingerprintScanner.release();
        checkSecureIDAuth(true);
        //set OTP also
        setShowPinCodeModal(true);
      })
      .catch(error => {
        FingerprintScanner.release();
        setShowPinCodeModal(true);
        checkSecureIDAuth(false);
      });
  }

  const nextHandler = () => {
    navigation.navigate('NotifyMeScreen');
  };

  const _setPinCode = async () => {
    if (pincode.length == 0) {
      setPincodeError(t('errors.required_pincode'));
      return;
    }
    setPincodeError('');

    if (!pincodeRegex.test(pincode)) {
      setPincodeError(t('errors.length_pincode', { max: 6 }));
      return;
    }
    setPincodeError('');

    if (confirmPincode.length == 0) {
      setConfirmPincodeError(t('errors.required_confirm_pincode'));
      return;
    }
    setConfirmPincodeError('');

    if (!pincodeRegex.test(confirmPincode)) {
      setConfirmPincodeError(t('errors.length_confirm_pincode', { max: 6 }));
      return;
    }
    setConfirmPincodeError('');

    if (pincode != confirmPincode) {
      showMessage('Zada Wallet', t('errors.pincode_confirm_not_match'));
      return;
    }

    // Saving pincode in async
    try {
      await saveItem(ConstantsList.PIN_CODE, pincode);
      let message = t('PincodeScreen.alert_message');

      setIsPincode(true);
      setShowPinCodeModal(false);
      showMessage('Zada Wallet', message);
      setPincode('');
      setConfirmPincode('');
      nextHandler();
    } catch (error) {
      showMessage('Zada Wallet', error?.toString());
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BACKGROUND_COLOR,
      }}>
      <View
        style={{
          flex: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={styles.TextContainerHead}>{t('SecurityScreen.title')}</Text>

        <TextComponent onboarding={true} text={t('SecurityScreen.sub_title')} />
      </View>
      <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
        <ImageBoxComponent source={img} />
      </View>
      <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
        <GreenPrimaryButton text={t('SecurityScreen.enable_btn')} nextHandler={enableSecureID} />
      </View>

      {/* PinCode Modal */}
      {showPincodeModal && (
        <PincodeModal
          modalType={'normal'}
          onCloseClick={() => setShowPinCodeModal(false)}
          isVisible={showPincodeModal}
          pincode={pincode}
          onPincodeChange={(text: string) => {
            setPincode(text);
            if (text.length == 0) setPincodeError('');
          }}
          pincodeError={pincodeError}
          confirmPincode={confirmPincode}
          onConfirmPincodeChange={(text: string) => {
            setConfirmPincode(text);
            if (text.length == 0) setConfirmPincodeError('');
          }}
          confirmPincodeError={confirmPincodeError}
          onContinueClick={_setPinCode}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  TextContainerHead: {
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 32,
    flexDirection: 'column',
  },
});

export default SecurityScreen;
