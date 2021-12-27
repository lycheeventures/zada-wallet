import 'react-native-gesture-handler';
import React from 'react';
import ErrorBoundary from 'react-native-error-boundary'
import { analytics_log_app_error } from './app/helpers/analytics';
import { ErrorFallback } from './app/components';
import { ThemeContext, NetworkContext } from './app/contexts';
import Root from './app/navigation/Root';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {

  const errorHandler = (error, stackTrace) => {
    analytics_log_app_error(stackTrace.toString())
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={errorHandler}>
      <NetworkContext>
        <ThemeContext>
          <NavigationContainer>
            <Root />
          </NavigationContainer>
        </ThemeContext>
      </NetworkContext>
    </ErrorBoundary >
  );
};

export default App;
