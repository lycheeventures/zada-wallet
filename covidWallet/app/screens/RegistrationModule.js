import React, { useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Config from 'react-native-config';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import PhoneInput from 'react-native-phone-number-input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PRIMARY_COLOR,
  BACKGROUND_COLOR,
  GREEN_COLOR,
  WHITE_COLOR,
  GRAY_COLOR,
} from '../theme/Colors';
import HeadingComponent from '../components/HeadingComponent';
import ConstantsList from '../helpers/ConfigApp';
import { saveItem, getItem, removeItem } from '../helpers/Storage';
import { showNetworkMessage, _showAlert } from '../helpers/Toast';
import { AuthenticateUser } from '../helpers/Authenticate';
import { InputComponent } from '../components/Input/inputComponent';
import { nameRegex, validateLength, validatePasswordStrength } from '../helpers/validation';
import { _resgiterUserAPI } from '../gateways/auth';
import SimpleButton from '../components/Buttons/SimpleButton';
import jwt_decode from 'jwt-decode';
import { _fetchingAppData } from '../helpers/AppData';
import { _handleAxiosError } from '../helpers/AxiosResponse';
import Recaptcha from 'react-native-recaptcha-that-works';
import TouchableComponent from '../components/Buttons/TouchableComponent';
import { useAppDispatch, useAppSelector } from '../store';
import { selectAuthStatus, selectToken, selectUser } from '../store/auth/selectors';
import { selectNetworkStatus } from '../store/app/selectors';
import { createWallet, fetchToken, loginUser } from '../store/auth/thunk';
import { updateTempVar } from '../store/auth';

const { width } = Dimensions.get('window');

function RegistrationModule({ navigation }) {
  // Redux
  const dispatch = useAppDispatch();

  // Selectors
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);
  const networkStatus = useAppSelector(selectNetworkStatus);

  // States
  const [activeOption, updateActiveOption] = useState('register');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneText, setPhoneText] = useState('');

  const [secret, setSecret] = useState('');
  const [secretError, setSecretError] = useState('');

  const [secureSecret, setSecureSecret] = useState(true);

  const [strengthMessage, setStrengthMessage] = useState(undefined);

  const [progress, setProgress] = useState(false);
  const [authCount, setAuthCount] = useState(0);

  // Refs
  const phoneInput = useRef(null);
  const recaptcha = useRef();

  // Toggling for password
  const _toggleSecureSecretEntry = () => {
    setSecureSecret(!secureSecret);
  };

  const selectionOnPress = (userType) => {
    updateActiveOption(userType);
  };

  React.useEffect(() => {
    const getCount = async () => {
      const authCount = JSON.parse((await getItem(ConstantsList.AUTH_COUNT)) | 0);
      setAuthCount(authCount);
    };
    const clearAuthAsync = async () => {
      removeItem(ConstantsList.REGISTRATION_DATA);
      removeItem(ConstantsList.LOGIN_DATA);
    };
    getCount();
    clearAuthAsync();
  }, []);

  React.useEffect(() => {
    if (activeOption == 'register') {
      setPhone('');
      // setSecret(randomString(24))
      setSecretError('');
    } else {
      setSecret('');
    }
  }, [activeOption]);

  const submit = async () => {
    login();

    return;
    // Check if name is valid.
    if (!nameRegex.test(name) && activeOption == 'register') {
      setNameError(
        'Please enter a name between 2-1000 alphabetical characters long. No numbers or special characters.'
      );
      return;
    }
    setNameError('');

    // Check if phone number is valid
    const checkValid = phoneInput.current?.isValidNumber(phone);
    if (!checkValid) {
      Alert.alert('Zada Wallet', 'Please enter a valid phone number.');
      return;
    }

    if (phoneText.charAt(0) == '0' && activeOption == 'register') {
      Alert.alert('Zada Wallet', 'Phone number should not start with zero');
      return;
    }

    // Check if secret
    if (secret == '') {
      setSecretError('Password is required.');
      return;
    }

    if (activeOption == 'register') {
      //check secret length min,max respectively
      if (validateLength(secret, 6, 30)) {
        setSecretError('Password length should be 6 to 30 characters');
        return;
      }
    }

    if (activeOption == 'login') {
      //check secret length min,max respectively
      if (validateLength(secret, 1, 50)) {
        setSecretError('Password length should be 1 to 50 characters');
        return;
      }
    }
    setSecretError('');

    setProgress(true);

    // Increament authentication count.
    await saveItem(ConstantsList.AUTH_COUNT, JSON.stringify(authCount + 1));
    setAuthCount((authCount) => authCount + 1);

    if (activeOption == 'register') register();
    else if (activeOption == 'login') login();
    else setProgress(false);
  };

  const register = async () => {
    try {
      if (networkStatus === 'connected') {
        let data = {
          name: name.trim(),
          phone: phone.trim(),
          secretPhrase: secret,
        };

        const result = await _resgiterUserAPI(data);
        const response = result.data;

        if (response.success) {
          // new user is going to register
          await saveItem(ConstantsList.REGISTRATION_DATA, JSON.stringify(response));
          await saveItem(ConstantsList.WALLET_SECRET, secret);
          navigation.replace('MultiFactorScreen', { from: 'Register' });
        } else if (response.verified != undefined && !response.verified) {
          // unverified user come to register
          await saveItem(ConstantsList.REGISTRATION_DATA, JSON.stringify(response));
          await saveItem(ConstantsList.WALLET_SECRET, secret);
          navigation.replace('MultiFactorScreen', { from: 'Register' });
        } else if (response.verified != undefined && response.verified) {
          // verified user came again to register
          selectionOnPress('login');
          _showAlert('Zada Wallet', response.error);
        } else {
          _showAlert('Zada Wallet', response.error);
        }
        setProgress(false);
      } else {
        setProgress(false);
        showNetworkMessage();
      }
    } catch (error) {
      console.log(error.response);
      setProgress(false);
      if (error.response && error.response.data) {
        _checkForVerification(error.response.data);
      }
    }
  };

  const _checkForVerification = async (response) => {
    try {
      if (response.verified != undefined && !response.verified) {
        // unverified user come to register
        await saveItem(ConstantsList.REGISTRATION_DATA, JSON.stringify(response));
        await saveItem(ConstantsList.WALLET_SECRET, secret);
        navigation.replace('MultiFactorScreen', { from: 'Register' });
      } else if (response.verified != undefined && response.verified) {
        // verified user came again to register
        selectionOnPress('login');
        _showAlert('Zada Wallet', response.error);
      } else {
        _showAlert('Zada Wallet', response.error);
      }
    } catch (error) {
      _handleAxiosError(error);
    }
  };

  // const login = async () => {
  //   if (networkStatus === 'connected') {
  //     await fetch(Config.API_URL + `/api/login`, {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         phone: phone,
  //         secretPhrase: secret,
  //       }),
  //     }).then((credsResult) =>
  //       credsResult.json().then(async (data) => {
  //         try {
  //           let response = JSON.parse(JSON.stringify(data));
  //           if (response.success == true) {
  //             // Updating user in store.
  //             dispatch(updateUser({ ...user, id: response.userId, walletSecret: secret }));

  //             // storeUserID(response.userId);
  //             // saveItem(ConstantsList.WALLET_SECRET, secret);
  //             // await saveItem(ConstantsList.LOGIN_DATA, JSON.stringify(response));

  //             await authenticateUserToken(response?.type);
  //           } else {
  //             showMessage('ZADA Wallet', response.error);
  //             setProgress(false);
  //           }
  //         } catch (error) {
  //           _handleAxiosError(error);
  //         } finally {
  //           setProgress(false);
  //         }
  //       })
  //     );
  //   } else {
  //     setProgress(false);
  //     showNetworkMessage();
  //   }
  // };
  const login = async () => {
    let resp = await dispatch(loginUser({ phone: '+923125688076', secret: 'test@1' })).unwrap();
    // Adding temp values in redux.
    dispatch(
      updateTempVar({
        isNew: true,
        type: resp.type,
        id: resp.userId,
        walletSecret: resp.walletSecret,
      })
    );
    await authenticateUserToken(resp?.type, resp.token);
  };

  // const createWallet = async (userToken) => {
  //   await fetch(Config.API_URL + `/api/wallet/create`, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: 'Bearer ' + userToken,
  //     },
  //   }).then((walletResult) =>
  //     walletResult.json().then(async (data) => {
  //       try {
  //         let response = JSON.parse(JSON.stringify(data));
  //         if (response.success === true) {
  //           // reauthentication
  //           let reAuth = await AuthenticateUser(true);

  //           if (reAuth.success) {
  //             // decoding token
  //             const decodedreAuthToken = jwt_decode(reAuth.token);

  //             if (decodedreAuthToken.dub.length) {
  //               await _fetchingAppData(networkStatus === 'connected');
  //               setProgress(false);
  //               // if token has wallet id
  //               navigation.replace('SecurityScreen');
  //             } else {
  //               //await authenticateUserToken();
  //             }
  //           } else {
  //             setProgress(false);
  //             _showAlert('ZADA Wallet', `${reAuth.message}`);
  //           }
  //         } else {
  //           _showAlert('ZADA Wallet', `${response.error}`);
  //         }
  //       } catch (error) {
  //         _showAlert('ZADA Wallet', `${error.toString()}`);
  //       }
  //     })
  //   );
  // };

  const authenticateUserToken = async (isDemo, userToken) => {
    isDemo = undefined;
    try {
      if (networkStatus === 'connected') {
        const decodedToken = jwt_decode(userToken);
        if (decodedToken.dub.length) {
          if (isDemo !== undefined && isDemo === 'demo') {
            navigation.replace('SecurityScreen');
          } else {
            navigation.replace('MultiFactorScreen', { from: 'Login' });
          }
        } else {
          // If walletid does not exist in database.
          // CREATING WALLET
          let response = await dispatch(createWallet(userToken)).unwrap();
          if (response.data.status === 'success') {
            navigation.replace('SecurityScreen');
          }
        }
      } else {
        showNetworkMessage();
      }
    } catch (error) {
      _showAlert('Zada Wallet', error.toString());
    }
  };

  function renderPhoneNumberInput() {
    return (
      <PhoneInput
        ref={phoneInput}
        defaultValue={phone}
        defaultCode="MM"
        layout="second"
        containerStyle={{
          flexDirection: 'row',
          backgroundColor: WHITE_COLOR,
          borderRadius: 10,
          height: 45,
          marginTop: 8,
          alignSelf: 'center',
          width: '88%',
          marginLeft: 4,
        }}
        textInputStyle={{ fontSize: 14, height: 45 }}
        countryPickerButtonStyle={{
          width: 65,
          borderRightColor: '00000040',
          borderRightWidth: 0.5,
        }}
        textContainerStyle={{
          fontSize: 16,
          padding: 0,
          borderRadius: 10,
          backgroundColor: WHITE_COLOR,
        }}
        codeTextStyle={{
          fontSize: 14,
          textAlign: 'center',
          textAlignVertical: 'center',
          padding: 0,
          margin: 0,
        }}
        onChangeFormattedText={(text) => {
          setPhone(text);
        }}
        onChangeText={(text) => {
          setPhoneText(text);
        }}
        disableArrowIcon
        withShadow
      />
    );
  }

  const onVerify = () => {
    submit();
  };

  // KEYBOARD AVOIDING VIEW
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 100 : 0;
  const keyboardBehaviour = Platform.OS === 'ios' ? 'padding' : null;

  return (
    <View pointerEvents={status === 'pending' ? 'none' : 'auto'} style={styles.topViewStyle}>
      <KeyboardAwareScrollView
        behavior={keyboardBehaviour}
        keyboardVerticalOffset={keyboardVerticalOffset}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View
          style={{
            backgroundColor: BACKGROUND_COLOR,
            alignContent: 'center',
            width: width - 40,
            justifyContent: 'space-around',
            borderRadius: 10,
          }}>
          <View style={{ marginLeft: 50, marginRight: 50 }}>
            <HeadingComponent text="Let's Get Started!" />
          </View>

          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                selectionOnPress('register');
                setName('');
                setNameError('');
                setSecret('');
                setSecretError('');
                setPhone('');
              }}>
              <Image
                style={{
                  height: 50,
                  width: '50%',
                  resizeMode: 'contain',
                  alignSelf: 'center',
                  tintColor: activeOption == 'register' ? GREEN_COLOR : 'grey',
                }}
                source={require('../assets/images/register.png')}
              />
              <Text
                style={{
                  width: 150,
                  height: 30,
                  textAlignVertical: 'center',
                  textAlign: 'center',
                  fontFamily: 'Poppins-Regular',
                  color: 'grey',
                }}>
                Register Account
              </Text>
              <View
                style={{
                  borderBottomColor: activeOption == 'register' ? GREEN_COLOR : 'grey',
                  borderBottomWidth: 4,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                selectionOnPress('login');
                setName('');
                setNameError('');
                setSecret('');
                setSecretError('');
                setPhone('');
              }}>
              <Image
                onPress={() => {
                  selectionOnPress('login');
                }}
                style={{
                  height: 50,
                  width: 50,
                  resizeMode: 'contain',
                  alignSelf: 'center',
                  tintColor: activeOption == 'login' ? GREEN_COLOR : 'grey',
                }}
                source={require('../assets/images/already.png')}
              />
              <Text
                style={{
                  width: 150,
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  fontFamily: 'Poppins-Regular',
                  height: 30,
                  color: 'grey',
                }}>
                Login
              </Text>
              <View
                style={{
                  borderBottomColor: activeOption == 'login' ? GREEN_COLOR : 'grey',
                  borderBottomWidth: 4,
                }}
              />
            </TouchableOpacity>
          </View>
          {activeOption == 'register' && (
            <View>
              <View>
                <InputComponent
                  placeholderText="Full Name (Official Name)"
                  errorMessage={nameError}
                  value={name}
                  isSecureText={false}
                  inputContainerStyle={styles.inputView}
                  setStateValue={(text) => setName(text)}
                />
              </View>

              {renderPhoneNumberInput()}
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
                  //inputContainerStyle={{width: '80%'}}
                  inputContainerStyle={styles.inputView}
                  strengthMessage={strengthMessage}
                  setStateValue={(text) => {
                    if (activeOption == 'register') {
                      setSecret(text.replace(',', ''));

                      const msg = validatePasswordStrength(text);
                      setStrengthMessage(msg);
                    }

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
                We need your details as your ZADA WALLET will be based on it. We are not going to
                send you ads or spam email, or sell your information to a 3rd party.
              </Text>
              <SimpleButton
                loaderColor={WHITE_COLOR}
                isLoading={status === 'pending'}
                onPress={authCount >= 3 ? recaptcha.current.open : submit}
                width={250}
                title="Continue"
                titleColor={WHITE_COLOR}
                buttonColor={GREEN_COLOR}
                style={{ marginVertical: 20, alignSelf: 'center' }}
              />
            </View>
          )}
          {activeOption == 'login' && (
            <View>
              {renderPhoneNumberInput()}

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
                  setStateValue={(text) => {
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
                // onPress={authCount >= 3 ? recaptcha.current.open : submit}
                onPress={submit}
                width={250}
                title="Continue"
                titleColor={WHITE_COLOR}
                buttonColor={GREEN_COLOR}
                style={{ marginVertical: 20, alignSelf: 'center' }}
              />
            </View>
          )}
        </View>

        {/* Google Recaptcha */}
        <Recaptcha
          ref={recaptcha}
          siteKey={ConstantsList.GOOGLE_RECAPTCHA_KEY}
          baseUrl={ConstantsList.RECAPTCHA_BASE_URL}
          onVerify={onVerify}
          headerComponent={
            <TouchableComponent
              style={styles.crossViewStyle}
              onPress={() => recaptcha.current.close()}>
              <Image
                resizeMode="contain"
                source={require('../assets/images/close.png')}
                style={styles.crossImageStyle}
              />
            </TouchableComponent>
          }
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topViewStyle: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
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
  secretMessage: {
    marginTop: 15,
    marginLeft: 24,
    color: 'grey',
  },
  SecretTextInput: {
    textAlign: 'center',
    height: 80,
    flex: 5,
    padding: 5,
    marginLeft: 5,
  },
  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 5,
  },
  TextContainerHead: {
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
    fontSize: 32,
  },
  ErrorBox: {
    color: 'red',
    fontSize: 13,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    textAlign: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    color: PRIMARY_COLOR,
  },
  checkbox: {
    paddingTop: '2%',
    color: PRIMARY_COLOR,
  },
  linkText: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontStyle: 'italic',
    margin: 5,
  },
  link: {
    color: 'black',
    fontSize: 14,
    marginBottom: 20,
  },
  primaryButton: {
    alignSelf: 'center',
    borderColor: GREEN_COLOR,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: GREEN_COLOR,
    paddingTop: 10,
    paddingLeft: 20,
    paddingBottom: 10,
    paddingRight: 20,
    marginTop: 10,
    marginBottom: 25,
    width: 250,
  },
  text: {
    color: WHITE_COLOR,
    alignSelf: 'center',
    fontFamily: 'Merriweather-Bold',
  },
  headerContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  textContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textRightIcon: {
    alignSelf: 'center',
    color: GRAY_COLOR,
    position: 'absolute',
    right: '10%',
    top: '30%',
  },
  crossViewStyle: {
    backgroundColor: '#000000',
    position: 'absolute',
    padding: 2,
    right: 16,
    top: 70,
    borderRadius: 20,
    zIndex: 100,
  },
  crossImageStyle: { width: 30, height: 30 },
});

export default RegistrationModule;
