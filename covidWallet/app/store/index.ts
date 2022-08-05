import { useDispatch, useSelector } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { AuthSlice } from './auth';
import { CredentialSlice } from './credentials';
import { ConnectionSlice } from './connections';
import { ActionSlice } from './actions';


const reducers = combineReducers({
    auth: AuthSlice.reducer,
    actions: ActionSlice.reducer,
    credential: CredentialSlice.reducer,
    connection: ConnectionSlice.reducer,
})

const store = configureStore({
    reducer: reducers,
    middleware: getDefaultMiddleware => {
        const middlewares = getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [],
            },
        })
        // .concat(api.middleware)

        // if (__DEV__ && !process.env.JEST_WORKER_ID) {
        //     const createDebugger = require('redux-flipper').default
        //     middlewares.push(createDebugger())
        // }

        return middlewares
    },
})


type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch;
const useAppDispatch = useDispatch;
const useAppSelector = useSelector;

// Types
export { AppDispatch, RootState }

export { store, useAppDispatch, useAppSelector }