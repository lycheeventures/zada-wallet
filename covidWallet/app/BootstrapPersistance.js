import React from 'react';
import { EncryptionGate } from './EncryptionGate';
import StoreGate from './StoreGate';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const BootstrapPersistance = ({ children }) => {
  return (
    <EncryptionGate>
      {(encryptionKey) => (
        <StoreGate encryptionKey={encryptionKey}>
          {({ store, persistor }) => {
            return (
              <Provider store={store}>
                <PersistGate persistor={persistor} loading={null}>
                  {children}
                </PersistGate>
              </Provider>
            );
          }}
        </StoreGate>
      )}
    </EncryptionGate>
  );
};

export default BootstrapPersistance;
