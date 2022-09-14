import { useDispatch, useSelector } from 'react-redux';
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { AuthSlice } from './auth';
import { CredentialSlice } from './credentials';
import { ConnectionSlice } from './connections';
import { ActionSlice } from './actions';
import { AppSlice } from './app';
import { authPersistConfig, rootPersistConfig } from './persistConfigs';

const reducers = combineReducers({
  app: AppSlice.reducer,
  auth: persistReducer(authPersistConfig, AuthSlice.reducer),
  actions: ActionSlice.reducer,
  credential: CredentialSlice.reducer,
  connection: ConnectionSlice.reducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/logout') {
    // check for action type
    state = undefined;
  }
  return reducers(state, action);
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });
    // .concat(api.middleware)

    // if (__DEV__ && !process.env.JEST_WORKER_ID) {
    //     const createDebugger = require('redux-flipper').default
    //     middlewares.push(createDebugger())
    // }

    return middlewares;
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
const useAppDispatch = useDispatch;
const useAppSelector = useSelector;

// Types
export { AppDispatch, RootState };

export { store, useAppDispatch, useAppSelector };
