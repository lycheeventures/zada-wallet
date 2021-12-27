import React, { createContext, useState } from 'react';
import { AppLoader } from '../components';

export const Context = createContext({
    _showAppLoader: (loadingMsg) => { },
    _closeAppLoader: () => { },
});

const LoadingContext = ({ children }) => {

    const [isLoading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState(false);

    const _showAppLoader = (message) => {
        setLoadingMsg(message);
        setLoading(true);
    }

    const _closeAppLoader = () => {
        setLoading(false);
    }

    return (
        <Context.Provider
            value={{
                _showAppLoader: _showAppLoader,
                _closeAppLoader: _closeAppLoader,
            }}
        >
            <AppLoader
                isVisible={isLoading}
                text={loadingMsg}
            />
            {children}
        </Context.Provider>
    )
}

export default LoadingContext;
