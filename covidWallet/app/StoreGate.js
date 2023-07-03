import { generateStore } from './store';

// const persistor = persistStore(store);
const StoreGate = ({ encryptionKey, children }) => {
  // const clearStore = async () => {
    
  // };
  // // if the encryption key is fresh, we need to flush AsyncStorage
  // if (encryptionKey.isFresh) {
  //   clearStore();
  // }

  return children(generateStore(encryptionKey));
};

export default StoreGate;
