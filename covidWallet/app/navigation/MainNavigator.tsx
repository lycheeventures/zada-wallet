import React from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { Platform, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { BACKGROUND_COLOR, BLACK_COLOR } from '../theme/Colors';
import { MainStack } from './types';

// Screens
import TabNavigator from './TabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import ContactUs from '../screens/ContactUs';
import AboutUs from '../screens/AboutUs';
import ProfileScreen from '../screens/ProfileScreen';
import QRScreen from '../screens/qr/QRScreen';
import useBiometric from '../hooks/useBiometric';
import CredDetailScreen from '../screens/credential/CredDetailScreen';

const navigationAnimation =
  Platform.OS == 'ios'
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.RevealFromBottomAndroid;

const MainNavigator = () => {
  // Hooks
  const { oneTimeAuthentication } = useBiometric();

  return (
    <MainStack.Navigator screenOptions={{ ...navigationAnimation }} initialRouteName="MainScreen">
      <MainStack.Screen
        name="MainScreen"
        options={({ navigation }) => ({
          headerStyle: {
            backgroundColor: BACKGROUND_COLOR,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitle: '',
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
            />
          ),
          headerRight: () => (
            <MaterialCommunityIcons
              onPress={() => {
                navigation.navigate('QRScreen');
              }}
              style={styles.headerRightIcon}
              size={30}
              name="qrcode"
            />
          ),
        })}
        component={TabNavigator}
      />
      <MainStack.Screen
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
            />
          ),
        })}
        component={SettingsScreen}
      />
      <MainStack.Screen
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
            />
          ),
        })}
        component={ContactUs}
      />

      <MainStack.Screen
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
            />
          ),
        })}
        component={AboutUs}
      />

      <MainStack.Screen
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
            />
          ),
        })}
        component={ProfileScreen}
      />
      <MainStack.Screen
        name="CredDetailScreen"
        component={CredDetailScreen}
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
      <MainStack.Screen
        options={{ headerShown: false }}
        name="QRScreen"
        path="/scanqr/:pathParam1?/:pathParam2?" //npx uri-scheme open https://zadanetwork.com/type=connection_data --android
        component={QRScreen}
      />
    </MainStack.Navigator>
  );
};

const styles = {
  headerRightIcon: {
    padding: 10,
    color: BLACK_COLOR,
  },
};

export default MainNavigator;
