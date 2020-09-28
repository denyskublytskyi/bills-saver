import React from "react";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import MainApp from "./MainApp";
import Auth from "./Auth";
import { AppContextProvider, useAppContext } from "./context/appContext";
import Loader from "./Loader";

const App = () => {
    const { isLoading, user } = useAppContext();

    if (isLoading) {
        return <Loader />;
    }

    return user ? <MainApp /> : <Auth />;
};

export default () => (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <AppContextProvider>
            <App />
        </AppContextProvider>
    </MuiPickersUtilsProvider>
);
