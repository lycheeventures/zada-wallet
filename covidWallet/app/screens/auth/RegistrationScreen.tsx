import React, { useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { RecaptchaHandles } from 'react-native-recaptcha-that-works';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  GREEN_COLOR,
  WHITE_COLOR,
  GRAY_COLOR,
  PRIMARY_COLOR,
  BACKGROUND_COLOR,
  AppColors,
} from '../../theme/Colors';
import { AuthStackParamList } from '../../navigation/types';

import ConstantsList from '../../helpers/ConfigApp';
import { saveItem, getItem } from '../../helpers/Storage';
import { showNetworkMessage, _showAlert } from '../../helpers/Toast';
import { validatePasswordStrength } from '../../helpers/validation';
import { _handleAxiosError } from '../../helpers/AxiosResponse';

import { _registerUserAPI } from '../../gateways/auth';

import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectAuthStatus } from '../../store/auth/selectors';
import { selectNetworkStatus } from '../../store/app/selectors';
import { registerUser } from '../../store/auth/thunk';

import HeadingComponent from '../../components/HeadingComponent';
import { InputComponent } from '../../components/Input/inputComponent';
import SimpleButton from '../../components/Buttons/SimpleButton';
import RegisterButton from './components/buttons/RegisterButton';
import LoginButton from './components/buttons/LoginButton';
import GoogleRecaptcha from './components/GoogleRecaptcha';
import PhoneInputComponent from './components/PhoneInputComponent';
import { validate } from '../../helpers/validations/validate';
import ChatBubble from '../../components/Chat/chatBubble';

const { width } = Dimensions.get('window');

const RegistrationScreen = ({
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
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('Please enter phone number.');
  const [secret, setSecret] = useState('');
  const [secretError, setSecretError] = useState('');
  const [secureSecret, setSecureSecret] = useState(true);
  const [strengthMessage, setStrengthMessage] = useState<'Strong' | 'Medium' | 'Weak' | ''>('');
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
    setName('');
    setPhone('');
    setSecret('');
  };

  const register = async () => {
    try {
      Keyboard.dismiss();
      if (networkStatus === 'connected') {
        let nameErr = validate('name', name);
        let passwordErr = validate('password', secret);
        setNameError(nameErr);
        setSecretError(passwordErr);
        if (nameErr !== '' || passwordErr !== '') return;

        // Phone validation
        if (phoneError != '') {
          _showAlert('Zada Wallet', phoneError);
          return;
        }

        let data = {
          name: name,
          phone: phone.trim(),
          secretPhrase: secret,
        };
        dispatch(registerUser({ name: data.name, phone: data.phone, secret: data.secretPhrase }));

        // Increament authentication count.
        await saveItem(ConstantsList.AUTH_COUNT, JSON.stringify(authCount + 1));
        setAuthCount((authCount) => authCount + 1);
      } else {
        showNetworkMessage();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Rendering Login and Register buttons.
  const renderAuthButtons = () => (
    <View style={styles.headerContainer}>
      {/* Register Button */}
      <RegisterButton
        screen="register"
        onPress={() => {
          navigation.navigate('RegistrationScreen');
        }}
      />

      {/* Login Button */}
      <LoginButton
        screen="register"
        onPress={() => {
          navigation.navigate('LoginScreen');
          resetState();
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
            <View>
              <InputComponent
                type={'default'}
                placeholderText="Full Name (Official Name)"
                errorMessage={nameError}
                value={name}
                isSecureText={false}
                inputContainerStyle={styles.inputView}
                setStateValue={setName}
              />
            </View>

            {/* Phone input component */}
            <PhoneInputComponent
              inputRef={phoneInputRef}
              phone={phone}
              setPhone={setPhone}
              setPhoneError={setPhoneError}
            />

            <Text style={styles.secretMessage}>Password (please save in safe place)</Text>
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
                strengthMessage={strengthMessage}
                setStateValue={(text: string) => {
                  setSecret(text.replace(',', ''));
                  const msg = validatePasswordStrength(text);
                  setStrengthMessage(msg);
                  if (text.length < 1) {
                    setSecretError('Password is required.');
                  } else {
                    setSecretError('');
                  }
                }}
              />
            </View>

            <Text
              style={{
                color: GRAY_COLOR,
                fontFamily: 'Poppins-Regular',
                marginLeft: 20,
                fontSize: 12,
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                marginTop: 10,
                marginRight: 20,
              }}>
              We need your details as your ZADA WALLET will be based on it. We are not going to send
              you ads or spam email, or sell your information to a 3rd party.
            </Text>
            <SimpleButton
              loaderColor={WHITE_COLOR}
              isLoading={status === 'pending'}
              onPress={authCount >= 3 ? recaptchaRef.current?.open : register}
              width={250}
              title="Continue"
              titleColor={WHITE_COLOR}
              buttonColor={GREEN_COLOR}
              style={{ marginVertical: 20, alignSelf: 'center' }}
            />
          </View>
        </View>
        {/* Recaptcha */}
        <GoogleRecaptcha recaptchaRef={recaptchaRef} onVerify={register} />
        <View style={styles.chatBubbleViewStyle}>
          <ChatBubble iconColor={AppColors.PRIMARY} backgroundColor={AppColors.WHITE} />
        </View>
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
  secretMessage: {
    marginTop: 15,
    marginLeft: 24,
    color: 'grey',
  },
  headerContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  chatBubbleViewStyle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    marginBottom: 50,
    marginRight: 18,
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
});

export default RegistrationScreen;
