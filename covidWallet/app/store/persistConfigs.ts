import AsyncStorage from '@react-native-async-storage/async-storage';

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  blacklist: ['auth'],
  // transforms: [encrypt],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  version: 1,
  blacklist: ['status'],
  // transforms: [encrypt],
};

export { rootPersistConfig, authPersistConfig };
