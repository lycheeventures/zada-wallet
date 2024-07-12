import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { RecaptchaHandles } from 'react-native-recaptcha-that-works';
import PhoneInputComponent from './components/PhoneInputComponent';
import { AppColors } from '../../theme/Colors';
import FadeView from '../../components/FadeView';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectUser } from '../../store/auth/selectors';
import { selectBaseUrl, selectNetworkStatus } from '../../store/app/selectors';
import {
  _showAlert,
  showNetworkMessage,
  getItemFromLocalStorage,
  saveItemInLocalStorage,
} from '../../helpers';
import ConstantsList from '../../helpers/ConfigApp';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { updateUser } from '../../store/auth';
import AnimatedButton from '../../components/Buttons/AnimatedButton';
import { getUserStatus, sendOTP } from '../../store/auth/thunk';
import AnimatedLoading from '../../components/Animations/AnimatedLoading';
import GoogleRecaptcha from './components/GoogleRecaptcha';
import Modal from 'react-native-modal';
import RadioButton from '../../components/Dialogs/components/RadioButton';
import useEnvironmentSwitch from '../../hooks/useEnvironmentSwitch';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}
const PhoneNumberScreen = (props: INProps) => {
  const dispatch = useAppDispatch<AppDispatch>();
  const networkStatus = useAppSelector(selectNetworkStatus);
  const user = useAppSelector(selectUser);
  const baseURL = useAppSelector(selectBaseUrl);
  const { t } = useTranslation();

  const { longPressCount, pressCount, buttonPressed, openEnvOptionsModal, closeEnvOptionsModal, selectedEnvOption, setSelectedEnvOption } = useEnvironmentSwitch();


  const recaptchaRef = useRef<RecaptchaHandles>(null);
  const phoneInputRef = useRef(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('Please enter phone number.');
  const [animateConfirmButtonValue, setAnimateConfirmButtonValue] = useState(new Animated.Value(0));
  const [confirmBtnDisabled, setConfirmBtnDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nextBtnCount, setNextBtnCount] = useState(0);

  console.log("BASE URL", baseURL)

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerBackground: () => (
        <View
          style={{
            backgroundColor: loading ? 'rgba(0, 0, 0, 0.25)' : AppColors.TRANSPARENT,
            height: '100%',
          }}
        />
      ),
    });
  }, [loading]);

  useEffect(() => {
    if (phoneError === '') {
      Animated.timing(animateConfirmButtonValue, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setConfirmBtnDisabled(false);
    } else {
      Animated.timing(animateConfirmButtonValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setAnimateConfirmButtonValue(new Animated.Value(0));
      setConfirmBtnDisabled(true);
    }
  }, [phoneError]);

  useEffect(() => {
    dispatch(updateUser({ ...user, phone: phone }));
  }, [phone]);

  useEffect(() => {
    const getCount = async () => {
      let count = (await getItemFromLocalStorage(ConstantsList.AUTH_COUNT)) || '0';
      const authCount = JSON.parse(count);
      setNextBtnCount(authCount);
    };
    getCount();
  }, []);

  const incrementBtnCount = async () => {
    // Increament authentication count.
    await saveItemInLocalStorage(ConstantsList.AUTH_COUNT, nextBtnCount + 1);
    setNextBtnCount(nextBtnCount => nextBtnCount + 1);
  };

  const _handleConfirmPress = async () => {
    if (networkStatus === 'connected') {
      // Return if phone number has errors
      if (phoneError !== '') {
        _showAlert('ZADA', phoneError);
        return;
      }
      if (phone) {
        Keyboard.dismiss();
        setLoading(true);
        dispatch(getUserStatus({ phone }))
          .unwrap()
          .then(res => {
            if (res.isVerified) {
              dispatch(sendOTP({ phone: phone, secret: undefined }));
              if (res.type === 'demo') {
                // If type is demo, skip to SecurityScreen
                props.navigation.navigate('SecurityScreen', { navigation: props.navigation });
              } else {
                props.navigation.navigate('VerifyOTPScreen');
                incrementBtnCount();
              }
            } else {
              props.navigation.navigate('RecoveryPhraseScreen');
              incrementBtnCount();
            }
            setLoading(false);
          })
          .catch(error => {
            setLoading(false);
            console.log(error);
          });
      }
    } else {
      showNetworkMessage();
    }
  };

  return (
    <FadeView style={{ flex: 1 }}>
      <Modal
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        onBackdropPress={closeEnvOptionsModal}
        isVisible={openEnvOptionsModal}
        animationIn={'slideInLeft'}
        animationOut={'slideOutRight'}
      >
        <View style={styles.optionsModalContainer}>
          <Text style={styles.optionsTitle}>Select Environment:</Text>
          <RadioButton option="Test Environment" selectedOption={selectedEnvOption} onSelect={setSelectedEnvOption} />
          <RadioButton option="Production Environment" selectedOption={selectedEnvOption} onSelect={setSelectedEnvOption} />
        </View>
      </Modal>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <View style={styles.imageViewStyle}>
          <Image
            resizeMode="contain"
            source={require('../../assets/images/phone.gif')}
            style={{ width: '100%', height: '100%' }}
          />
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.envSwitchButton}
            onLongPress={buttonPressed}
            onPress={longPressCount !== 3 ? () => { } : buttonPressed}
          ></TouchableOpacity>
        </View>
        <Text style={styles.phoneHeadingStyle}>{t('PhoneNumberScreen.sub_title')}</Text>
        <View style={styles.inputContainer}>
          {/* Phone input component */}
          <PhoneInputComponent
            defaultCountry={user.country ? user.country : 'MM'}
            autofocus={true}
            inputRef={phoneInputRef}
            phone={phone}
            setPhone={setPhone}
            setPhoneError={setPhoneError}
          />
        </View>

        <Text style={styles.devTextStyle}>
          {longPressCount === 3
            ? 'Now just tap ' + (4 - pressCount) + ' more times!'
            : ''}
        </Text>
        
        <View style={styles.btnContainer}>
          <AnimatedButton
            title={t('common.next')}
            animateBtnValue={animateConfirmButtonValue}
            onPress={
              nextBtnCount >= 3
                ? recaptchaRef.current?.open || _handleConfirmPress
                : _handleConfirmPress
            }
            disabled={confirmBtnDisabled}
            firstColor={AppColors.DISABLED_COLOR}
            secondColor={AppColors.PRIMARY}
            firstTextColor={AppColors.GRAY}
          />
        </View>
      </KeyboardAvoidingView>
      <GoogleRecaptcha recaptchaRef={recaptchaRef} onVerify={_handleConfirmPress} />
      {loading && <AnimatedLoading type="FadingCircleAlt" color={AppColors.PRIMARY} />}
    </FadeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageViewStyle: {
    height: 200,
    borderRadius: 100,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoViewStyle: {
    height: 200,
    width: 200,
    borderRadius: 100,
    backgroundColor: AppColors.PRIMARY,
  },
  phoneHeadingStyle: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: AppColors.BLACK,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  btnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devTextStyle: {
    textAlign: 'center',
    marginTop: 24,
    color: "grey",
  },
  optionsModalContainer: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 16
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  envSwitchButton: {
    position: 'absolute',
    width: 100,
    height: 200,
    right: 16,
  }
});

export default PhoneNumberScreen;
