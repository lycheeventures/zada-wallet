import React from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';

import { AuthStack } from './types';

// Screens
import IntroScreen from '../screens/IntroScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import PassCodeContainer from '../containers/PassCodeContainer';
import SecureidContainer from '../containers/SecureIdContainer';
import NotifyMeScreen from '../screens/NotifyMeScreen';
import SecurityScreen from '../screens/SecurityScreen';
import MultiFactorScreen from '../screens/MultiFactorScreen';
import RegistrationScreen from '../screens/auth/RegistrationScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/otp/OTPScreen';

const navigationAnimation =
  Platform.OS == 'ios'
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.RevealFromBottomAndroid;

const fadeNavigationConfig = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ ...navigationAnimation }}>
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="IntroScreen"
        component={IntroScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="WelcomeScreen"
        component={WelcomeScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false, cardStyleInterpolator: fadeNavigationConfig }}
        name="RegistrationScreen"
        component={RegistrationScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false, cardStyleInterpolator: fadeNavigationConfig }}
        name="LoginScreen"
        component={LoginScreen}
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
        name="MultiFactorScreen"
        component={MultiFactorScreen}
      />
      <AuthStack.Screen options={{ headerShown: false }} name="OTPScreen" component={OTPScreen} />
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
