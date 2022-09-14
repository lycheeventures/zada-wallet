import React, { useEffect, useState } from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';

// Screens
import IntroScreen from '../screens/IntroScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import RegistrationModule from '../screens/RegistrationModule';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import PassCodeContainer from '../containers/PassCodeContainer';
import SecureidContainer from '../containers/SecureIdContainer';
import NotifyMeScreen from '../screens/NotifyMeScreen';
import SecurityScreen from '../screens/SecurityScreen';
import MultiFactorScreen from '../screens/MultiFactorScreen';

const Stack = createStackNavigator();
const navigationAnimation =
  Platform.OS == 'ios'
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.RevealFromBottomAndroid;

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ ...navigationAnimation }}>
      <Stack.Screen options={{ headerShown: false }} name="IntroScreen" component={IntroScreen} />
      <Stack.Screen
        options={{ headerShown: false }}
        name="WelcomeScreen"
        component={WelcomeScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="RegistrationScreen"
        component={RegistrationModule}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="MultiFactorScreen"
        component={MultiFactorScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="PassCodeContainer"
        component={PassCodeContainer}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="SecurityScreen"
        component={SecurityScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="SecureidContainer"
        component={SecureidContainer}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="NotifyMeScreen"
        component={NotifyMeScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
