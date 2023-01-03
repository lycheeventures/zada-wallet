import React from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';

import { AuthStack } from './types';

// Screens
import IntroScreen from '../screens/IntroScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import PassCodeContainer from '../containers/PassCodeContainer';
import SecureidContainer from '../containers/SecureIdContainer';
import NotifyMeScreen from '../screens/NotifyMeScreen';
import SecurityScreen from '../screens/SecurityScreen';
import MultiFactorScreen from '../screens/MultiFactorScreen';

const navigationAnimation =
  Platform.OS == 'ios'
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.RevealFromBottomAndroid;

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
      <AuthStack.Screen options={{ headerShown: false }} name="AuthScreen" component={AuthScreen} />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="MultiFactorScreen"
        component={MultiFactorScreen}
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
