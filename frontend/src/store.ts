import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import { preferencesReducer } from "./slicers/preferencesSlice";
import { authReducer } from "./slicers/authSlice";
import { wsReducer } from "./slicers/wsSlice";
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    storage,
}

const rootReducer = combineReducers({
    auth: authReducer,
    preferences: preferencesReducer,
    websocket: wsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PERSIST, REGISTER, PURGE, PAUSE],
        },
    }),
    devTools: true,
});

type StoreType = typeof store;
type AppDispatch = typeof store.dispatch;
type RootState = ReturnType<typeof store.getState>

const persistor = persistStore(store);

export { store, persistor };

export type { AppDispatch, RootState, StoreType };