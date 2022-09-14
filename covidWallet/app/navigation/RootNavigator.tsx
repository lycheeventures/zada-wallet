import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { checkVersion, CheckVersionResponse } from 'react-native-check-version';
import SplashScreen from 'react-native-splash-screen';
import { createStackNavigator } from '@react-navigation/stack';

import VersionModal from '../components/VersionModal';
import useInit from '../hooks/useInit';
import AppConfig from '../helpers/ConfigApp';
import { saveItem } from '../helpers/Storage';
import { useAppDispatch, useAppSelector } from '../store';
import { selectNetworkStatus } from '../store/app/selectors';
import LoadingScreen from '../screens/LoadingScreen';
import { selectIsAuthorized, selectToken, selectUser } from '../store/auth/selectors';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import { updateNetworkStatus } from '../store/app';
import useNetwork from '../hooks/useNetwork';

const Stack = createStackNavigator();

const RootNavigator = () => {
  // Constants
  const dispatch = useAppDispatch();
  const linking = {
    prefixes: ['https://zadanetwork.com', 'zada://'], //npx uri-scheme open https://zadanetwork.com/connection_request/abcd --android
  };

  // Selectors
  const networkStatus = useAppSelector(selectNetworkStatus);
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectUser);
  const isAuthorized = useAppSelector(selectIsAuthorized);

  // States
  const [isNewVersion, setIsNewVersion] = useState(false);
  const [versionDetails, setVersionDetails] = useState<CheckVersionResponse | null>(null);
  const [isLoading, setLoading] = useState(true);

  // Hooks
  useNetwork();
  const { isAppReady, messageIndex, setMessageIndex } = useInit();

  useEffect(() => {
    dispatch(updateNetworkStatus(true));
  }, [isAppReady]);

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
          _checkAuthStatus();
        }
      } else {
        _checkAuthStatus();
        setLoading(false);
      }
    })();
  }, [networkStatus, setMessageIndex]);

  // Checking auth status
  const _checkAuthStatus = () => {
    // retrieveData();
  };

  // On Version skip click
  const _onSkipClick = () => {
    setIsNewVersion(false);
    _checkAuthStatus();
  };

  console.log('isAuthorized => ', !isAuthorized)
  return (
    <NavigationContainer linking={linking}>
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
      ) : !isAuthorized ? (
        <AuthNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
