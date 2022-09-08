import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { persistStore } from 'redux-persist';
import NetworkContext from './app/context/NetworkContext';
import NavigationComponent from './app/Navigation';
import { PRIMARY_COLOR } from './app/theme/Colors';
import ErrorBoundary from 'react-native-error-boundary';
import { analytics_log_app_error } from './app/helpers/analytics';
import ErrorFallback from './app/components/ErrorFallback';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { PersistGate } from 'redux-persist/integration/react';

let persistor = persistStore(store);

const App = () => {
  const errorHandler = (error, stackTrace) => {
    analytics_log_app_error(stackTrace.toString());
  };

  return (
    <NetworkContext>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={errorHandler}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <View style={styles.viewStyle}>
              <NavigationComponent />
            </View>
          </PersistGate>
        </Provider>
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
