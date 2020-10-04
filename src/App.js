import React from "react";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import flat from "flat";
import { IntlProvider } from "react-intl";

import MainApp from "./MainApp";
import Auth from "./Auth";
import { AppContextProvider, useAppContext } from "./context/appContext";
import Loader from "./Loader";
import en from "./translations/en.json";
import ru from "./translations/ru.json";
import uk from "./translations/uk.json";
import dateFnsLocales from "./translations";

const messages = {
    en: flat(en),
    ru: flat(ru),
    uk: flat(uk),
};

const App = () => {
    const { isLoading, user, locale } = useAppContext();

    if (isLoading) {
        return <Loader />;
    }

    return (
        <IntlProvider
            locale={locale}
            messages={messages[locale] || messages.en}
        >
            <MuiPickersUtilsProvider
                utils={DateFnsUtils}
                locale={dateFnsLocales[locale] || dateFnsLocales.en}
            >
                {user ? <MainApp /> : <Auth />}
            </MuiPickersUtilsProvider>
        </IntlProvider>
    );
};

export default () => (
    <AppContextProvider>
        <App />
    </AppContextProvider>
);
