import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import * as firebase from "firebase";
import noop from "lodash/noop";
import logger from "../lib/logger";

const firebaseConfig = {
    apiKey: "AIzaSyASFO8tv9fqsASlbgUGSIUT3xU9ypU0v0Y",
    appId: "1:470502617058:web:3a21c33ac8e54f4ee8d3bb",
    authDomain: "bills-saver.firebaseapp.com",
    clientID:
        "470502617058-59ljik0e0kcekoatmfdla5mp4tvn1k7o.apps.googleusercontent.com",
    databaseURL: "https://bills-saver.firebaseio.com",
    messagingSenderId: "470502617058",
    projectId: "bills-saver",
    storageBucket: "bills-saver.appspot.com",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const AppContext = createContext({
    auth,
    isLoading: false,
    signOut: noop,
    user: null,
});

const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const signOut = useCallback(() => auth.signOut(), []);

    useEffect(() => {
        const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
            setUser(user);

            if (user) {
                const script = document.createElement("script");
                script.type = "text/javascript";
                script.src = "https://apis.google.com/js/api.js";
                script.onload = async () => {
                    window.gapi.load("client:auth2", async () => {
                        logger.info("Google API client is loaded");

                        await window.gapi.client.init({
                            apiKey: firebaseConfig.apiKey,
                            clientId: firebaseConfig.clientID,
                            discoveryDocs: [
                                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                            ],
                            scope: "https://www.googleapis.com/auth/drive",
                        });
                        setIsLoading(false);
                    });
                };
                document.getElementsByTagName("head")[0].appendChild(script);
                return;
            }
            setIsLoading(false);
        });
        return () => {
            unregisterAuthObserver();
        };
    });

    return (
        <AppContext.Provider
            value={{
                auth,
                isLoading,
                signOut,
                user,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

const useAppContext = () => useContext(AppContext);

export { useAppContext, AppContextProvider };
