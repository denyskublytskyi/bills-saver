import React from "react";

import MainApp from "./MainApp";
import Auth from "./Auth";
import { AppContextProvider, useAppContext } from "./context/appContext";
import { GapiProvider } from "./context/gapiContext";

const App = () => {
    const { isLoading, user } = useAppContext();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return user ? <MainApp /> : <Auth />;
};

export default () => (
    <AppContextProvider>
        <GapiProvider>
            <App />
        </GapiProvider>
    </AppContextProvider>
);
