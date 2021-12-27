import React, { useState } from 'react';
import { StyleSheet, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import TabNavigator from './components/TabNavigator';
import { AuthContext } from './contexts/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SplashScreen from 'react-native-splash-screen';
import PassCodeContainer from './containers/PassCodeContainer';
import AuthenticationContainer from './containers/AuthenticationContainer';
import WelcomeScreen from './screens/WelcomeScreen';
import SecureIdContainer from './containers/SecureIdContainer';
import SecurityScreen from './screens/SecurityScreen';
import NotifyMeScreen from './screens/NotifyMeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SettingsScreen from './screens/SettingsScreen';
import DetailsScreen from './screens/DetailsScreen';
import QRScreen from './screens/QRScreen';
import { BLACK_COLOR, BACKGROUND_COLOR } from './theme/Colors';
import RegistrationModule from './screens/RegistrationModule';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import MultiFactorScreen from './screens/MultiFactorScreen';
import LoadingScreen from './screens/LoadingScreen';
import ProfileScreen from './screens/ProfileScreen';
import { RefreshContextProvider } from './contexts/RefreshContextProvider';
import useBiometric from './hooks/useBiometric';
import { analytics_log_logout } from './helpers/analytics';
import { _fetchingAppData } from './helpers/AppData';
import NetInfo from "@react-native-community/netinfo";
import ScanningDocument from './screens/ScanningDocument';

const Stack = createStackNavigator();

const navigationAnimation =
  Platform.OS == "ios"
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.RevealFromBottomAndroid;

function NavigationComponent() {

  const linking = {
    prefixes: ['https://zadanetwork.com', 'zada://'], //npx uri-scheme open https://zadanetwork.com/connection_request/abcd --android
  };

  // Biometric Hook
  const { authStatus, oneTimeAuthentication } = useBiometric();

  const [isFirstTime, getisFirstTime] = React.useState('true');
  const [isLoading, setLoading] = useState(true);
  const storeData = async () => {
    try {
      await AsyncStorage.setItem('isfirstTime', 'false');
    } catch (error) {
      // Error saving data
    }
  };

  const retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('isfirstTime').then(async (value) => {
        setLoading(false);
        if (value == null) {
          SplashScreen.hide();
          getisFirstTime('true');
        }
        else if (value == 'true') {
          SplashScreen.hide();
          getisFirstTime('true');
        }
        else if (value == 'false') {
          getisFirstTime('false');
          NetInfo.fetch().then(async (state) => {
            await _fetchingAppData(state.isConnected);
            SplashScreen.hide();
          });
        }
      });
    } catch (error) {
      // Error retrieving data
    }
  };

  // Checking auth status
  const _checkAuthStatus = () => {
    retrieveData();
  }

  React.useEffect(() => {
    _checkAuthStatus();
  }, [isFirstTime]);

  const _loggingOut = () => {
    try {
      AsyncStorage.setItem('isfirstTime', 'true');
      analytics_log_logout();
    } catch (error) {
      alert(error);
    }
  }

  const authContext = React.useMemo(
    () => ({
      isFirstTimeFunction: () => {
        storeData();
        getisFirstTime('false');
      },
      logout: () => {
        _loggingOut();
        getisFirstTime('true');
      }
    }),
    [],
  );

  return (
    <AuthContext.Provider value={authContext}>
      <RefreshContextProvider>
        <NavigationContainer linking={linking}>
          {isLoading ? (
            <Stack.Navigator
              screenOptions={{
                gestureEnabled: false,
              }}
            >
              <Stack.Screen
                options={{ headerShown: false }}
                name="LoadingScreen"
                component={LoadingScreen}
              />
            </Stack.Navigator>
          ) : isFirstTime === 'true' ? (
            <Stack.Navigator
              screenOptions={{
                ...navigationAnimation,
                gestureEnabled: false,
                headerTitleAlign: 'center',
                headerBackTitleVisible: false,
                headerTintColor: BLACK_COLOR,
              }}
            >
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
                component={SecureIdContainer}
              />
              <Stack.Screen
                options={{ headerShown: false }}
                name="NotifyMeScreen"
                component={NotifyMeScreen}
              />
              <Stack.Screen
                options={({ navigation }) => ({
                  headerTitleAlign: 'center',
                  title: 'Get ZADA ID',
                  headerStyle: {
                    backgroundColor: BACKGROUND_COLOR,
                  }
                })}
                name="ScanningDocScreen"
                component={ScanningDocument}
              />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator
              screenOptions={{
                ...navigationAnimation,
                gestureEnabled: false,
                headerTitleAlign: 'center',
                headerBackTitleVisible: false,
                headerTintColor: BLACK_COLOR,
                headerTitleStyle: {
                  fontSize: 18,
                }
              }}
            >
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
                        navigation.navigate('SettingsScreen', { oneTimeAuthentication });
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
                  title: 'Settings',
                  headerTitle: 'Settings',
                  headerLeft: () => (
                    <MaterialIcons
                      onPress={() => {
                        navigation.goBack();
                      }}
                      style={styles.headerRightIcon}
                      size={26}
                      name="arrow-back"
                      padding={30}
                    />
                  ),
                })}
                component={SettingsScreen}
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
                      size={26}
                      name="arrow-back"
                      padding={30}
                    />
                  ),
                })}
                component={ProfileScreen}
              />
              <Stack.Screen
                options={{ headerShown: false }}
                name="DetailsScreen"
                component={DetailsScreen}
                options={({ navigation }) => ({
                  headerTitle: 'Details',
                  title: 'Details',
                  headerStyle: {
                    backgroundColor: BACKGROUND_COLOR
                  },
                  headerLeft: () => (
                    <MaterialIcons
                      onPress={() => {
                        navigation.goBack();
                      }}
                      style={styles.headerRightIcon}
                      size={26}
                      name="arrow-back"
                      padding={30}
                    />
                  )
                })}
              />
              <Stack.Screen
                options={{ headerShown: false }}
                name="RegistrationScreen"
                component={RegistrationModule}
              />
              <Stack.Screen
                options={({ navigation }) => ({
                  headerTitleAlign: 'center',
                  title: 'Get ZADA ID',
                  headerStyle: {
                    backgroundColor: BACKGROUND_COLOR,
                  }
                })}
                name="ScanningDocScreen"
                component={ScanningDocument}
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
          )}
        </NavigationContainer>
      </RefreshContextProvider>
    </AuthContext.Provider >
  );
}

const styles = StyleSheet.create({
  headerRightIcon: {
    padding: 10,
    color: BLACK_COLOR,
  },
});

export default NavigationComponent;
export { AuthContext };
