import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, Dimensions, Linking, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import HeadingComponent from '../../components/HeadingComponent';
import { BACKGROUND_COLOR, GREEN_COLOR, PRIMARY_COLOR, WHITE_COLOR } from '../../theme/Colors';
import SimpleButton from '../../components/Buttons/SimpleButton';
import { showNetworkMessage, _showAlert } from '../../helpers/Toast';
import BackButton from '../../components/Buttons/BackButton';
import { _sendPasswordResetAPI } from '../../gateways/auth';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectNetworkStatus } from '../../store/app/selectors';
import { InputComponent } from '../../components/Input/inputComponent';
import { validate } from '../../helpers/validations/validate';
import { selectAuthStatus } from '../../store/auth/selectors';
import { resetUserPassword } from '../../store/auth/thunk';

const { width } = Dimensions.get('window');

const ResetPasswordScreen = ({ route, navigation }) => {
  const dispatch = useAppDispatch<AppDispatch>();
  const metadata = route.params.metadata;
  const networkStatus = useAppSelector(selectNetworkStatus);
  const authStatus = useAppSelector(selectAuthStatus);

  const [deepLink, setDeepLink] = useState(true);
  const [secret, setSecret] = useState('');
  const [secretError, setSecretError] = useState('');
  const [confirmSecret, setConfirmSecret] = useState('');
  const [confirmSecretError, setConfirmSecretError] = useState('');
  const [secureSecret, setSecureSecret] = useState(true);
  const [confirmSecureSecret, setSecureConfirmSecret] = useState(true);
  //   const [isLoading, setLoading] = useState(false);

  // KEYBOARD AVOIDING VIEW
  const keyboardVerticalOffset = Platform.OS == 'ios' ? 100 : 0;
  const keyboardBehaviour = Platform.OS == 'ios' ? 'padding' : null;

  // Toggling for Secret
  const _toggleSecureSecretEntry = () => {
    setSecureSecret(!secureSecret);
  };
  const _toggleSecureConfirmSecretEntry = () => {
    setSecureConfirmSecret(!secureSecret);
  };

  const onSetPasswordButtonClick = () => {
    // Return if internet is unavailable
    if (networkStatus === 'disconnected') {
      showNetworkMessage();
      return;
    }

    // Validate password
    let passwordErr = validate('password', secret);
    setSecretError(passwordErr);
    if (passwordErr !== '') {
      setSecretError(passwordErr);
      return;
    }

    // Validate password and confirm password match.
    if (secret !== confirmSecret) {
      setConfirmSecretError('Password do not match!');
      return;
    }

    // Execute API
    dispatch(resetUserPassword({ password: secret, confirmPassword: confirmSecret, metadata }));
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: PRIMARY_COLOR,
      }}>
      <BackButton
        onPress={() => {
          console.log('yes');
          navigation.goBack();
        }}
        color={WHITE_COLOR}
      />
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
          {/* Heading */}
          <View style={{ marginLeft: 50, marginRight: 50 }}>
            <HeadingComponent text="New Password!" />
          </View>

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
            <InputComponent
              type={'secret'}
              toggleSecureEntry={_toggleSecureConfirmSecretEntry}
              placeholderText="Confirm Password"
              errorMessage={confirmSecretError}
              value={confirmSecret}
              keyboardType="default"
              isSecureText={confirmSecureSecret}
              autoCapitalize={'none'}
              inputContainerStyle={styles.inputView}
              setStateValue={(text: string) => {
                setConfirmSecret(text.replace(',', ''));
                if (text.length < 1) {
                  setConfirmSecretError('Confirm Password is required.');
                } else {
                  setConfirmSecretError('');
                }
              }}
            />
          </View>

          {/* set password Button */}
          <SimpleButton
            isLoading={authStatus === 'pending'}
            loaderColor={WHITE_COLOR}
            onPress={onSetPasswordButtonClick}
            width={250}
            title="Set Password"
            titleColor={WHITE_COLOR}
            buttonColor={GREEN_COLOR}
            style={{
              alignSelf: 'center',
              marginTop: 30,
              marginBottom: 25,
            }}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  _mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default ResetPasswordScreen;
