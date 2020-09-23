import React from "react";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

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
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <AppContextProvider>
            <GapiProvider>
                <App />
            </GapiProvider>
        </AppContextProvider>
    </MuiPickersUtilsProvider>
);
