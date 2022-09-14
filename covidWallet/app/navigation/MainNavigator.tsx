import React, { useEffect, useState } from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { BACKGROUND_COLOR, BLACK_COLOR } from '../theme/Colors';

// Screens
import TabNavigator from './TabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import ContactUs from '../screens/ContactUs';
import AboutUs from '../screens/AboutUs';
import ProfileScreen from '../screens/ProfileScreen';
import DetailsScreen from '../screens/DetailsScreen';
import RegistrationModule from '../screens/RegistrationModule';
import QRScreen from '../screens/qr/QRScreen';
import AuthenticationContainer from '../containers/AuthenticationContainer';
import useBiometric from '../hooks/useBiometric';

const Stack = createStackNavigator();
const navigationAnimation =
  Platform.OS == 'ios'
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.RevealFromBottomAndroid;

const MainNavigator = () => {
  // Hooks
  const { oneTimeAuthentication } = useBiometric();

  return (
    <Stack.Navigator screenOptions={{ ...navigationAnimation }}>
      <Stack.Screen
        name="MainScreen"
        options={({ navigation }) => ({
          headerStyle: {
            backgroundColor: BACKGROUND_COLOR,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          title: false,
          headerLeft: () => (
            <FontAwesome
              onPress={() => {
                navigation.navigate('SettingsScreen', {
                  oneTimeAuthentication,
                });
              }}
              style={styles.headerRightIcon}
              size={30}
              name="navicon"
              padding={30}
            />
          ),
        })}
        component={TabNavigator}
      />
      <Stack.Screen
        name="SettingsScreen"
        options={({ navigation }) => ({
          headerTitle: 'Settings',
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name="arrow-back"
              padding={30}
            />
          ),
        })}
        component={SettingsScreen}
      />
      <Stack.Screen
        name="ContactUs"
        options={({ navigation }) => ({
          headerTitle: 'Contact Us',
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name="arrow-back"
              padding={30}
            />
          ),
        })}
        component={ContactUs}
      />

      <Stack.Screen
        name="AboutUs"
        options={({ navigation }) => ({
          headerTitle: 'About Us',
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name="arrow-back"
              padding={30}
            />
          ),
        })}
        component={AboutUs}
      />

      <Stack.Screen
        name="ProfileScreen"
        options={({ navigation }) => ({
          headerTitle: 'Edit Profile',
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name="arrow-back"
              padding={30}
            />
          ),
        })}
        component={ProfileScreen}
      />
      <Stack.Screen
        name="DetailsScreen"
        component={DetailsScreen}
        options={({ navigation }) => ({
          headerTintColor: 'black',
          headerStyle: {
            backgroundColor: BACKGROUND_COLOR,
          },
          headerTitle: () => (
            <Text
              style={{
                fontSize: 24,
                color: BLACK_COLOR,
                textAlign: 'center',
              }}>
              Details
            </Text>
          ),
        })}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="RegistrationScreen"
        component={RegistrationModule}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="QRScreen"
        path="/scanqr/:pathParam1?/:pathParam2?" //npx uri-scheme open https://zadanetwork.com/type=connection_data --android
        component={QRScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="AuthenticationContainer"
        component={AuthenticationContainer}
      />
    </Stack.Navigator>
  );
};

const styles = {
  headerRightIcon: {
    padding: 10,
    color: BLACK_COLOR,
  },
};

export default MainNavigator;
