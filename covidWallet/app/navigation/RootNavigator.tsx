import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import SpInAppUpdates, { IAUUpdateKind, StartUpdateOptions } from 'sp-react-native-in-app-updates';

import { useAppSelector } from '../store';
import { selectIsAuthorized } from '../store/auth/selectors';
import { selectNetworkStatus } from '../store/app/selectors';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import { navigationRef } from './utils';
import useNetwork from '../hooks/useNetwork';
import useAppInit from '../hooks/useAppInit';
import LoadingScreen from '../screens/LoadingScreen';
import BiometricModal from '../components/Modal/BiometricModal';

const RootNavigator = () => {
  // for checking updates only once per app start
  const hasCheckedUpdate = useRef(false);
  const appStarted = useRef(true);

  // Selectors
  const networkStatus = useAppSelector(selectNetworkStatus);
  const isAuthorized = useAppSelector(selectIsAuthorized);

  // Hooks
  useNetwork();
  const { isAppReady } = useAppInit();

  useEffect(() => {
    // Check for app updates on app start
    if (networkStatus !== 'connected') return;
    if (hasCheckedUpdate.current) return;

    hasCheckedUpdate.current = true;
    checkForUpdates();
  }, [networkStatus]);

  const checkForUpdates = async () => {
    try {
      const inAppUpdates = new SpInAppUpdates(
        false // isDebug
      );
      inAppUpdates.checkNeedsUpdate().then(result => {
        if (result.shouldUpdate) {
          let updateOptions: StartUpdateOptions = {};
          if (Platform.OS === 'android') {
            // android only, on iOS the user will be promped to go to your app store page
            updateOptions = {
              updateType: IAUUpdateKind.FLEXIBLE,
            };
          }
          inAppUpdates.startUpdate(updateOptions);
        }
      });
    } catch (error) {
      console.log('In-app update error:', error);
    }
  };

  if (!isAppReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {!isAuthorized ? (
        <AuthNavigator />
      ) : (
        <>
          <MainNavigator />
          <BiometricModal appStarted={appStarted} />
        </>
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
