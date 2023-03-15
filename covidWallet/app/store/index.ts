import { useDispatch, useSelector } from 'react-redux';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'reduxjs-toolkit-persist';
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1';
import { Persistor } from 'reduxjs-toolkit-persist/lib/types';
import { configureStore, combineReducers, Store } from '@reduxjs/toolkit';
import { AuthSlice } from './auth';
import { CredentialSlice } from './credentials';
import { ConnectionSlice } from './connections';
import { ActionSlice } from './actions';
import { AppSlice } from './app';
import { createEncryptor } from './utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setup } from '../gateways/http_client';
import { middleware } from './middleware';

let store: Store;
let persistor: Persistor;

let reducers = combineReducers({
  app: AppSlice.reducer,
  auth: AuthSlice.reducer,
  actions: ActionSlice.reducer,
  credential: CredentialSlice.reducer,
  connection: ConnectionSlice.reducer,
});

// Fake function to get store type.
const functionForGettingStoreType = (preloadedState = {}) => {
  return configureStore({
    reducer: reducers,
    preloadedState,
  });
};

// Generating store.
export const generateStore = (encryptionKey: { isFresh: boolean; key: string }) => {
  const encryptionTransform = createEncryptor({ secretKey: encryptionKey.key });

  const rootPersistConfig = {
    key: 'root',
    storage: AsyncStorage,
    version: 2,
    blacklist: ['auth'],
    transforms: [encryptionTransform],
    stateReconciler: autoMergeLevel1,
  };

  const authPersistConfig = {
    key: 'auth',
    storage: AsyncStorage,
    version: 2,
    blacklist: ['status'],
    transforms: [encryptionTransform],
  };

  reducers = combineReducers({
    app: AppSlice.reducer,
    auth: persistReducer(authPersistConfig, AuthSlice.reducer),
    actions: ActionSlice.reducer,
    credential: CredentialSlice.reducer,
    connection: ConnectionSlice.reducer,
  });

  const rootReducer = (state: any, action: any) => {
    return reducers(state, action);
  };

  const persistedReducer = persistReducer(rootPersistConfig, rootReducer);
  store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => {
      const middlewares = getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(middleware);
      return middlewares;
    },
  });
  persistor = persistStore(store);
  setup(store);
  return { store, persistor };
};

// Exporting
type RootState = ReturnType<typeof reducers>;
type AppDispatch = ReturnType<typeof functionForGettingStoreType>['dispatch'];
const useAppDispatch = useDispatch;
const useAppSelector = useSelector;

// Types
export { AppDispatch, RootState };

export { store, persistor, useAppDispatch, useAppSelector };
