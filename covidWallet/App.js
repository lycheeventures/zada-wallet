import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetworkContext from './app/context/NetworkContext';
import RootNavigator from './app/navigation/RootNavigator';
import { PRIMARY_COLOR } from './app/theme/Colors';
import ErrorBoundary from 'react-native-error-boundary';
import { analytics_log_app_error } from './app/helpers/analytics';
import ErrorFallback from './app/components/ErrorFallback';
import BootstrapPersistance from './app/BootstrapPersistance';
import './app/locales/index';

const App = () => {
  const errorHandler = (error, stackTrace) => {
    analytics_log_app_error(stackTrace.toString());
  };

  return (
    <NetworkContext>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={errorHandler}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
        <BootstrapPersistance>
          <SafeAreaProvider style={styles.viewStyle}>
            <RootNavigator />
          </SafeAreaProvider>
        </BootstrapPersistance>
      </ErrorBoundary>
    </NetworkContext>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
});
export default App;
