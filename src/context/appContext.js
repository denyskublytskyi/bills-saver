import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import noop from "lodash/noop";
import { useLocalStorage } from "react-use";

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
const db = firebase.database();

const AppContext = createContext({
    auth,
    db,
    firebaseConfig,
    folders: null,
    gapiToken: null,
    isLoading: false,
    setGapiToken: noop,
    signOut: noop,
    user: null,
});

const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gapiToken, setGapiToken] = useLocalStorage(
        "gapi_access_token",
        null,
        { raw: true }
    );

    const signOut = useCallback(async () => auth.signOut(), []);

    useEffect(() => {
        const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
            setUser(user);
            setIsLoading(false);
        });
        return () => {
            unregisterAuthObserver();
        };
    });

    const [folders, setFolders] = useState();
    useEffect(() => {
        if (!user) {
            return;
        }
        db.ref(`settings/${user.uid}`)
            .child("folders")
            .on("value", (snap) => {
                setFolders(snap.val());
            });
    }, [user]);

    return (
        <AppContext.Provider
            value={{
                auth,
                db,
                firebaseConfig,
                folders,
                gapiToken,
                isLoading,
                setGapiToken,
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
