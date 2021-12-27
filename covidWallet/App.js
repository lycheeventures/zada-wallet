import 'react-native-gesture-handler';
import React from 'react';
import ErrorBoundary from 'react-native-error-boundary'
import { analytics_log_app_error } from './app/helpers/analytics';
import { ErrorFallback } from './app/components';
import { ThemeContext, NetworkContext, LoadingContext } from './app/contexts';
import RootNavigator from './app/navigation/RootNavigator';
import { NavigationContainer } from '@react-navigation/native';
import AlertContext from './app/contexts/AlertContext';

const App = () => {

  const errorHandler = (error, stackTrace) => {
    analytics_log_app_error(stackTrace.toString())
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={errorHandler}>
      <LoadingContext>
        <AlertContext>
          <NetworkContext>
            <ThemeContext>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </ThemeContext>
          </NetworkContext>
        </AlertContext>
      </LoadingContext>
    </ErrorBoundary>
  );
};

export default App;
