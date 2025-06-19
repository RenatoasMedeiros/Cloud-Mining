import { FunctionComponent, useEffect } from 'react'
import { Provider } from 'react-redux';
import { AppRouter } from './components/AppRouter';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { setup } from './api';

const App: FunctionComponent = () => {

    const applyTheme = () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark', prefersDark);
    }

    useEffect(() => {
        applyTheme();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

        setup();

        return () => {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
        }
    }, [])

    return (
        <PersistGate persistor={persistor}>
            <Provider store={store}>
                <AppRouter />
            </Provider>
        </PersistGate>
    );
};

export { App }
