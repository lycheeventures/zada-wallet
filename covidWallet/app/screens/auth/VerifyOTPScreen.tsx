import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  BackHandler,
  Platform,
  Keyboard,
} from 'react-native';
import { AppColors } from '../../theme/Colors';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectUser } from '../../store/auth/selectors';
import FadeView from '../../components/FadeView';
import { validateUserOTP } from '../../store/auth/thunk';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import AnimatedLoading from '../../components/Animations/AnimatedLoading';
import InputPinComponent from '../../components/Input/InputPinComponent';
import ResendCode from './components/ResendCode';
import { useTranslation } from 'react-i18next';
import { saveItemInLocalStorage, showMessage } from '../../helpers';
import ConstantsList from '../../helpers/ConfigApp';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}

const VerifyOTPScreen = (props: INProps) => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  // States
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
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
    BackHandler.addEventListener('hardwareBackPress', onBackButtonPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackButtonPress);
    };
  }, []);

  const onBackButtonPress = () => {
    props.navigation.navigate('PhoneNumberScreen');
    return true;
  };

  useEffect(() => {
    if (code.length === 6 && user.phone) {
      let phone = user.phone;
      Keyboard.dismiss();
      setLoading(true);
      dispatch(validateUserOTP({ phone, code }))
        .unwrap()
        .then(response => {
          setLoading(false);
          if (response.isRegistered) {
            props.navigation.navigate('SecurityScreen', { navigation: props.navigation });
            // clear authentication count.
            saveItemInLocalStorage(ConstantsList.AUTH_COUNT, 0);
          } else {
            props.navigation.navigate('RegistrationScreen');
          }
        })
        .catch(error => {
          showMessage('ZADA Wallet', error.message);
          setLoading(false);
        });
    }
  }, [code]);

  const codeEmptyComponent = () => {
    return (
      <View
        style={{
          height: 30,
          width: 30,
          borderBottomWidth: 2,
          borderColor: AppColors.BLACK,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color: AppColors.BLACK,
            fontFamily: 'Poppins-Regular',
            fontSize: 20,
          }}>
          *
        </Text>
      </View>
    );
  };

  const codeFilledComponent = (digit: string) => {
    return (
      <View
        style={{
          height: 30,
          width: 30,
          borderBottomWidth: 2,
          borderColor: AppColors.BLACK,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color: AppColors.BLACK,
            fontFamily: 'Poppins-Regular',
            fontSize: 20,
          }}>
          {digit}
        </Text>
      </View>
    );
  };

  return (
    <FadeView style={{ flex: 2 }}>
      <View style={styles.imageStyle}>
        <Image
          resizeMode="contain"
          source={require('../../assets/images/otp.gif')}
          style={{ width: '100%', height: '100%' }}
        />
      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <Text style={styles.headingStyle}>{t('VerifyOTPScreen.title')}</Text>
        <Text style={styles.subheadingStyle}>
          {t('VerifyOTPScreen.sub_title_1')} {user.phone}, {t('VerifyOTPScreen.sub_title_2')}
        </Text>
        <View style={styles.inputContainer}>
          <InputPinComponent
            OTP
            onPincodeChange={setCode}
            pincodeError={codeError}
            emptyComponent={codeEmptyComponent}
            filledComponent={codeFilledComponent}
          />
        </View>
      </KeyboardAvoidingView>
      {loading && <AnimatedLoading type="FadingCircleAlt" color={AppColors.PRIMARY} />}

      <View style={styles.resendOTPContainer}>{<ResendCode navigation={props.navigation} />}</View>
    </FadeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageStyle: {
    flex: 0.5,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingStyle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: AppColors.PRIMARY,
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subheadingStyle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: AppColors.GRAY,
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendOTPContainer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default VerifyOTPScreen;
