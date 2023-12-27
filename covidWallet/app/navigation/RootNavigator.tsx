import React, { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import SpInAppUpdates, { IAUUpdateKind, StartUpdateOptions } from 'sp-react-native-in-app-updates';
import SplashScreen from 'react-native-splash-screen';
import { createStackNavigator } from '@react-navigation/stack';

import useInit from '../hooks/useInit';
import { getItemFromLocalStorage, saveItem } from '../helpers/Storage';
import { AppDispatch, useAppSelector } from '../store';
import { selectNetworkStatus } from '../store/app/selectors';
import LoadingScreen from '../screens/LoadingScreen';
import { selectIsAuthorized } from '../store/auth/selectors';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import useNetwork from '../hooks/useNetwork';
import { navigationRef } from './utils';
import { updateAppSetupComplete } from '../store/app';
import { useAppDispatch } from '../store/index-old';
import useWebview from '../hooks/useWebview';

const Stack = createStackNavigator();
const RootNavigator = () => {
  // Constants
  const linking = {
    prefixes: ['https://zadanetwork.com', 'zada://'], //npx uri-scheme open https://zadanetwork.com/connection_request/abcd --android
  };
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const networkStatus = useAppSelector(selectNetworkStatus);
  const isAuthorized = useAppSelector(selectIsAuthorized);

  // States

  // Hooks
  useNetwork();
  const { isAppReady, messageIndex, setMessageIndex, startApp } = useInit();

  // Checking for latest version.
  useEffect(() => {
    (async () => {
      setMessageIndex(0);
      SplashScreen.hide();
      let isAppSetupComplete = await getItemFromLocalStorage('isAppSetupComplete');
      dispatch(updateAppSetupComplete(isAppSetupComplete));

      // Check for updates
      checkForUpdates();
    })();
  }, [networkStatus, setMessageIndex]);

  // Functions
  const checkForUpdates = async () => {
    const inAppUpdates = new SpInAppUpdates(
      false // isDebug
    );
    inAppUpdates.checkNeedsUpdate().then(result => {
      let updateOptions: StartUpdateOptions = {};
      if (Platform.OS === 'android') {
        // android only, on iOS the user will be promped to go to your app store page
        updateOptions = {
          updateType: IAUUpdateKind.FLEXIBLE,
        };
      }
      inAppUpdates.startUpdate(updateOptions);
    });
    startApp();
  };

  const renderNavigator = useCallback(() => {
    if (!isAuthorized) {
      return <AuthNavigator />;
    } else {
      return <MainNavigator />;
    }
  }, [isAuthorized]);

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      {useWebview()}
      {!isAppReady ? (
        <Stack.Navigator>
          <Stack.Screen
            options={{ headerShown: false }}
            name="LoadingScreen"
            children={() => <LoadingScreen messageIndex={messageIndex} />}
          />
        </Stack.Navigator>
      ) : (
        renderNavigator()
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
