import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import { InputComponent } from '../../components/Input/inputComponent';
import { AppColors } from '../../theme/Colors';
import FadeView from '../../components/FadeView';
import { validate } from '../../helpers/validations/validate';
import { _showAlert, showNetworkMessage } from '../../helpers';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { updateUserProfile } from '../../store/auth/thunk';
import { selectNetworkStatus } from '../../store/app/selectors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { selectToken, selectUser } from '../../store/auth/selectors';
import { ConnectionAPI } from '../../gateways';
import { AuthenticateUser } from './utils';
import { updateToken } from '../../store/auth';
import AnimatedLoading from '../../components/Animations/AnimatedLoading';
import { Button } from 'react-native-elements';
import PrimaryButton from '../../components/Buttons/PrimaryButton';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}

const { width, height } = Dimensions.get('window');

const RegistrationScreen = (props: INProps) => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const networkStatus = useAppSelector(selectNetworkStatus);
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectUser);

  const [values, setValues] = useState({ name: '', email: '' });
  const [error, setError] = useState({
    email: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    // Return if network is unavailable
    if (networkStatus != 'connected') {
      showNetworkMessage();
      return;
    }

    if (error.email.length !== 0 && values.email.length > 0) {
      _showAlert('ZADA', error.email + error.name);
      return;
    }
    if (error.name.length !== 0) {
      _showAlert('ZADA', error.email + error.name);
      return;
    }

    // Handle login logic here
    setLoading(true);
    dispatch(
      updateUserProfile({
        name: values.name.toLowerCase(),
        email: values.email.toLowerCase(),
        country: user.country?.toLowerCase(),
        language: user.language?.toLowerCase(),
      })
    )
      .unwrap()
      .then(async (res) => {
        let result = await ConnectionAPI.get_ConnectionList(user.country?.toLowerCase());
        if (result.data.success) {
          
          // Generating wallet if does not exist
          let newToken = await AuthenticateUser(token, true);
          dispatch(updateToken(newToken));

          // Navigating
          if (result.data.connections.length === 0) {
            props.navigation.navigate('SecurityScreen', { navigation: props.navigation });
          } else {
            props.navigation.navigate('ConnectionListScreen', {
              connections: result.data.connections,
            });
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const _handleChangeText = (key: 'email' | 'name', value: string) => {
    setValues({ ...values, [key]: value });
    if (key === 'email' && value.length < 1) {
      setError({ ...error, email: '' });
      return;
    }
    setError({ ...error, [key]: validate(key, value) });
  };

  return (
    <FadeView style={{ flex: 1 }}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
          <View style={styles.headingTextContainer}></View>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Text style={styles.headingText}>Hello</Text>
              <Text style={styles.subHeadingText}>Create a new account</Text>
            </View>

            <View style={styles.formContainer}>
              <InputComponent
                type={'default'}
                leftIconName={'user'}
                placeholderText="Full Name (Official Name) *"
                errorMessage={error.name}
                value={values.name}
                isSecureText={false}
                inputContainerStyle={styles.inputView}
                setStateValue={(text: string) => _handleChangeText('name', text)}
              />
              <InputComponent
                autoCapitalize={'none'}
                type={'default'}
                keyboardType={'email-address'}
                leftIconName={'mail'}
                placeholderText="Email (Optional)"
                errorMessage={error.email}
                value={values.email}
                isSecureText={false}
                inputContainerStyle={styles.inputView}
                style={{ marginTop: 26 }}
                setStateValue={(text: string) => _handleChangeText('email', text)}
              />
            </View>

            <PrimaryButton
              onPress={handleSubmit}
              icon={{
                name: 'arrow-forward',
                color: AppColors.WHITE,
              }}
              buttonStyle={{
                alignSelf: 'flex-end',
                borderRadius: 50,
                width: 60,
                height: 60,
                backgroundColor: AppColors.PRIMARY,
              }}
            />
          </View>
        </KeyboardAvoidingView>

        {loading && <AnimatedLoading type="FadingCircleAlt" color={AppColors.PRIMARY} />}
      </View>
    </FadeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  headingTextContainer: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  headingText: {
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
  },
  subHeadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: AppColors.PRIMARY,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
  },
  // input: {
  //   backgroundColor: '#fff',
  //   borderRadius: 8,
  //   height: 40,
  //   marginBottom: 16,
  //   paddingHorizontal: 16,
  // },
  inputView: {
    backgroundColor: AppColors.WHITE,
    borderRadius: 4,
    width: width * 0.7,
    borderBottomWidth: 1,
    borderColor: AppColors.GRAY,
    marginLeft: 10,
    height: 45,
    marginTop: 8,
    paddingLeft: 16,
  },
  loginButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#777',
  },
});

export default RegistrationScreen;
