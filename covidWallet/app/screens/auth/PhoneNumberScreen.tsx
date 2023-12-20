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
} from 'react-native';
import PhoneInputComponent from './components/PhoneInputComponent';
import { AppColors } from '../../theme/Colors';
import FadeView from '../../components/FadeView';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectUser } from '../../store/auth/selectors';
import { selectNetworkStatus } from '../../store/app/selectors';
import { _showAlert, showNetworkMessage } from '../../helpers';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { updateUser } from '../../store/auth';
import AnimatedButton from '../../components/Buttons/AnimatedButton';
import { getUserStatus, sendOTP } from '../../store/auth/thunk';
import AnimatedLoading from '../../components/Animations/AnimatedLoading';
import { useTranslation } from 'react-i18next';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}
const PhoneNumberScreen = (props: INProps) => {
  const dispatch = useAppDispatch<AppDispatch>();
  const networkStatus = useAppSelector(selectNetworkStatus);
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  const phoneInputRef = useRef(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('Please enter phone number.');
  const [animateConfirmButtonValue, setAnimateConfirmButtonValue] = useState(new Animated.Value(0));
  const [confirmBtnDisabled, setConfirmBtnDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const _handleConfirmPress = () => {
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
          .then((res) => {
            if (res.isVerified) {
              dispatch(sendOTP({ phone: phone, secret: undefined }));
              if (res.type === 'demo') {
                // If type is demo, skip to SecurityScreen
                props.navigation.navigate('SecurityScreen', { navigation: props.navigation });
              } else {
                props.navigation.navigate('VerifyOTPScreen');
              }
            } else {
              props.navigation.navigate('RecoveryPhraseScreen');
            }
            setLoading(false);
          })
          .catch((error) => {
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

        <View style={styles.btnContainer}>
          <AnimatedButton
            title={t('common.next')}
            animateBtnValue={animateConfirmButtonValue}
            onPress={_handleConfirmPress}
            disabled={confirmBtnDisabled}
            firstColor={AppColors.DISABLED_COLOR}
            secondColor={AppColors.PRIMARY}
            firstTextColor={AppColors.GRAY}
          />
        </View>
      </KeyboardAvoidingView>
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
});

export default PhoneNumberScreen;
