import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { checkVersion, CheckVersionResponse } from 'react-native-check-version';
import SplashScreen from 'react-native-splash-screen';
import { createStackNavigator } from '@react-navigation/stack';

import VersionModal from '../components/VersionModal';
import useInit from '../hooks/useInit';
import AppConfig from '../helpers/ConfigApp';
import { saveItem } from '../helpers/Storage';
import { useAppSelector } from '../store';
import { selectNetworkStatus } from '../store/app/selectors';
import LoadingScreen from '../screens/LoadingScreen';
import { selectIsAuthorized } from '../store/auth/selectors';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import useNetwork from '../hooks/useNetwork';
import { navigationRef } from './utils';

const Stack = createStackNavigator();
const RootNavigator = () => {
  // Constants
  const linking = {
    prefixes: ['https://zadanetwork.com', 'zada://'], //npx uri-scheme open https://zadanetwork.com/connection_request/abcd --android
  };

  // Selectors
  const networkStatus = useAppSelector(selectNetworkStatus);
  const isAuthorized = useAppSelector(selectIsAuthorized);

  // States
  const [isNewVersion, setIsNewVersion] = useState(false);
  const [versionDetails, setVersionDetails] = useState<CheckVersionResponse | null>(null);
  const [isLoading, setLoading] = useState(true);

  // Hooks
  useNetwork();
  const { isAppReady, messageIndex, setMessageIndex, startApp } = useInit();

  // Checking for latest version.
  useEffect(() => {
    (async () => {
      setMessageIndex(0);
      SplashScreen.hide();
      if (networkStatus === 'connected') {
        const version = await checkVersion();
        if (version.needsUpdate) {
          setIsNewVersion(true);
          setVersionDetails(version);
          await saveItem(AppConfig.APP_VERSION, JSON.stringify(version));
        } else {
          startApp();
        }
      } else {
        startApp();
        setLoading(false);
      }
    })();
  }, [networkStatus, setMessageIndex]);

  // On Version skip click
  const _onSkipClick = () => {
    setIsNewVersion(false);
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
      <VersionModal
        isVisible={isNewVersion}
        versionDetails={versionDetails}
        skipCallback={() => {
          _onSkipClick();
        }}
      />
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
