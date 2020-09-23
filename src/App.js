import React from "react";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";

import MainApp from "./MainApp";
import Auth from "./Auth";
import { AppContextProvider, useAppContext } from "./context/appContext";

const App = () => {
    const { isLoading, user } = useAppContext();

    if (isLoading) {
        return (
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
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
