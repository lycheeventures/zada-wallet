import React, { useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { RecaptchaHandles } from 'react-native-recaptcha-that-works';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GREEN_COLOR, WHITE_COLOR, PRIMARY_COLOR, BACKGROUND_COLOR } from '../../theme/Colors';
import { AuthStackParamList } from '../../navigation/types';
import ConstantsList from '../../helpers/ConfigApp';
import { getItem } from '../../helpers/Storage';
import { showNetworkMessage, _showAlert } from '../../helpers/Toast';
import { _handleAxiosError } from '../../helpers/AxiosResponse';

import { _registerUserAPI } from '../../gateways/auth';

import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectAuthStatus } from '../../store/auth/selectors';
import { selectNetworkStatus } from '../../store/app/selectors';
import { loginUser } from '../../store/auth/thunk';

import HeadingComponent from '../../components/HeadingComponent';
import { InputComponent } from '../../components/Input/inputComponent';
import SimpleButton from '../../components/Buttons/SimpleButton';
import RegisterButton from './components/buttons/RegisterButton';
import LoginButton from './components/buttons/LoginButton';
import PhoneInputComponent from './components/PhoneInputComponent';
import GoogleRecaptcha from './components/GoogleRecaptcha';

const { width } = Dimensions.get('window');

const LoginScreen = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}) => {
  // Constants
  // KEYBOARD AVOIDING VIEW
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 100 : 0;
  const keyboardBehaviour = Platform.OS === 'ios' ? 'padding' : null;

  // Redux
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const status = useAppSelector(selectAuthStatus);
  const networkStatus = useAppSelector(selectNetworkStatus);

  // States
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('Please enter phone number.');
  const [secret, setSecret] = useState('');
  const [secretError, setSecretError] = useState('');
  const [secureSecret, setSecureSecret] = useState(true);
  const [authCount, setAuthCount] = useState(0);

  // Refs
  const phoneInputRef = useRef(null);
  const recaptchaRef = useRef<RecaptchaHandles>(null);

  // Toggling for password
  const _toggleSecureSecretEntry = () => {
    setSecureSecret(!secureSecret);
  };

  React.useEffect(() => {
    const getCount = async () => {
      const authCount = JSON.parse((await getItem(ConstantsList.AUTH_COUNT)) | 0);
      setAuthCount(authCount);
    };
    getCount();
  }, []);

  const resetState = () => {
    setPhone('');
    setSecret('');
  };

  // Login
  const login = async () => {
    Keyboard.dismiss();
    if (networkStatus === 'connected') {
      // We only use length check to support previous account password. They have password with less than 6 characters.
      // let passwordErr = validate('password', secret);
      let passwordErr = '';
      if (secret.length < 1) {
        passwordErr = 'Password length should be 1 to 50 characters';
      }
      setSecretError(passwordErr);
      if (passwordErr !== '') return;

      // Phone validation
      if (phoneError != '') {
        _showAlert('Zada Wallet', phoneError);
        return;
      }

      let data = {
        phone: phone.trim(),
        secretPhrase: secret,
      };
      dispatch(loginUser({ phone: data.phone, secret: data.secretPhrase }));
    } else {
      showNetworkMessage();
    }
  };

  // Rendering Login and Register buttons.
  const renderAuthButtons = () => (
    <View style={styles.headerContainer}>
      {/* Register Button */}
      <RegisterButton
        screen="login"
        onPress={() => {
          navigation.navigate('RegistrationScreen');
          resetState();
        }}
      />

      {/* Login Button */}
      <LoginButton
        screen="login"
        onPress={() => {
          navigation.navigate('LoginScreen');
        }}
      />
    </View>
  );

  return (
    <View
      pointerEvents={status === 'pending' ? 'none' : 'auto'}
      style={styles.topViewContainerStyle}>
      <KeyboardAwareScrollView
        behavior={keyboardBehaviour}
        keyboardVerticalOffset={keyboardVerticalOffset}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.topViewStyle}>
          <View style={{ marginLeft: 50, marginRight: 50 }}>
            <HeadingComponent text="Let's Get Started!" />
          </View>

          {/* Auth Buttons */}
          {renderAuthButtons()}

          <View>
            {/* Phone input component */}
            <PhoneInputComponent
              inputRef={phoneInputRef}
              phone={phone}
              setPhone={setPhone}
              setPhoneError={setPhoneError}
            />

            <View>
              <InputComponent
                type={'secret'}
                toggleSecureEntry={_toggleSecureSecretEntry}
                placeholderText="Password"
                errorMessage={secretError}
                value={secret}
                keyboardType="default"
                isSecureText={secureSecret}
                autoCapitalize={'none'}
                inputContainerStyle={styles.inputView}
                setStateValue={(text: string) => {
                  setSecret(text.replace(',', ''));
                  if (text.length < 1) {
                    setSecretError('Password is required.');
                  } else {
                    setSecretError('');
                  }
                }}
              />
            </View>
            <Text
              onPress={() => {
                navigation.navigate('ForgotPasswordScreen');
              }}
              style={styles._forgotText}>
              Forgot password?
            </Text>
            <SimpleButton
              loaderColor={WHITE_COLOR}
              isLoading={status === 'pending'}
              onPress={authCount >= 3 ? recaptchaRef.current?.open : login}
              width={250}
              title="Continue"
              titleColor={WHITE_COLOR}
              buttonColor={GREEN_COLOR}
              style={{ marginVertical: 20, alignSelf: 'center' }}
            />
          </View>
        </View>

        {/* Recaptcha */}
        <GoogleRecaptcha recaptchaRef={recaptchaRef} onVerify={login} />
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topViewContainerStyle: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
  },
  topViewStyle: {
    backgroundColor: BACKGROUND_COLOR,
    alignContent: 'center',
    width: width - 40,
    justifyContent: 'space-around',
    borderRadius: 10,
  },
  inputView: {
    backgroundColor: WHITE_COLOR,
    borderRadius: 10,
    width: '94%',
    marginLeft: 10,
    height: 45,
    marginTop: 8,
    paddingLeft: 16,
    borderBottomWidth: 0,
  },
  _forgotText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: PRIMARY_COLOR,
    textDecorationLine: 'underline',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 5,
  },
  headerContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});

export default LoginScreen;
