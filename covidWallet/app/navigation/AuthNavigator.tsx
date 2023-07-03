import React from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';

import { AuthStack, AuthStackParamList } from './types';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import PassCodeContainer from '../containers/PassCodeContainer';
import SecureidContainer from '../containers/SecureIdContainer';
import NotifyMeScreen from '../screens/NotifyMeScreen';
import SecurityScreen from '../screens/SecurityScreen';
import RegistrationScreen from '../screens/auth/RegistrationScreen';
import ConsentScreen from '../screens/auth/ConsentScreen';
import PhoneNumberScreen from '../screens/auth/PhoneNumberScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';
import { HeaderLeftButton } from '../screens/auth/components/buttons/HeaderButtons';
import ConnectionListScreen from '../screens/auth/ConnectionListScreen';
import { useAppSelector } from '../store';
import { selectAppSetupComplete } from '../store/app/selectors';
import PreferenceScreen from '../screens/auth/PreferenceScreen';
import RecoveryPhraseScreen from '../screens/auth/RecoveryPhraseScreen';

const navigationAnimation =
  Platform.OS == 'ios'
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.RevealFromBottomAndroid;

const fadeNavigationConfig = ({ current }: { current: any }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const AuthNavigator = () => {
  const isAppSetupComplete = useAppSelector(selectAppSetupComplete);
  let routeName: keyof AuthStackParamList = isAppSetupComplete
    ? 'PhoneNumberScreen'
    : 'PreferenceScreen';

  return (
    <AuthStack.Navigator screenOptions={{ ...navigationAnimation }} initialRouteName={routeName}>
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="PreferenceScreen"
        component={PreferenceScreen}
      />
      <AuthStack.Screen
        options={({ navigation, route }) => ({
          headerLeft: () => <HeaderLeftButton navigation={navigation} route={route} />,
          headerShown: true,
          title: '',
          headerStyle: {
            backgroundColor: 'transparent',
          },
        })}
        name="ConsentScreen"
        component={ConsentScreen}
      />
      <AuthStack.Screen
        options={({ navigation, route }) => ({
          headerLeft: () =>
            routeName !== 'PhoneNumberScreen' && (
              <HeaderLeftButton navigation={navigation} route={route} />
            ),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
          },
          headerStyle: {
            backgroundColor: 'transparent',
          },
        })}
        name="PhoneNumberScreen"
        component={PhoneNumberScreen}
      />
      <AuthStack.Screen
        options={({ navigation, route }) => ({
          headerLeft: () => <HeaderLeftButton navigation={navigation} route={route} />,
          headerShown: true,
          title: 'Your Recovery Phrase',
          headerTitleStyle: {
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
          },
          headerStyle: {
            backgroundColor: 'transparent',
          },
        })}
        name="RecoveryPhraseScreen"
        component={RecoveryPhraseScreen}
      />
      <AuthStack.Screen
        options={({ navigation, route }) => ({
          headerLeft: () => <HeaderLeftButton navigation={navigation} route={route} />,
          headerShown: true,
          headerBackTitle: 'Back',
          title: '',
          headerStyle: {
            backgroundColor: 'transparent',
          },
        })}
        name="VerifyOTPScreen"
        component={VerifyOTPScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="WelcomeScreen"
        component={WelcomeScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="ConnectionListScreen"
        component={ConnectionListScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false, cardStyleInterpolator: fadeNavigationConfig }}
        name="RegistrationScreen"
        component={RegistrationScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="PassCodeContainer"
        component={PassCodeContainer}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="SecurityScreen"
        component={SecurityScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="SecureidContainer"
        component={SecureidContainer}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="NotifyMeScreen"
        component={NotifyMeScreen}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
