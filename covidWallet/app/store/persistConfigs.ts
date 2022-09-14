import AsyncStorage from '@react-native-async-storage/async-storage';

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  blacklist: ['auth'],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['status'],
};

export { rootPersistConfig, authPersistConfig };
