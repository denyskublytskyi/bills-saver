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
import ms from "ms";

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
    changeFolder: noop,
    changeLocale: noop,
    db,
    filenamePattern: undefined,
    firebaseConfig,
    folders: undefined,
    gapiToken: null,
    isDBLoading: true,
    isLoading: false,
    language: null,
    setFoldersLastUpdatedAt: noop,
    setGapiToken: noop,
    signOut: noop,
    user: null,
});

const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDBLoading, setIsDBLoading] = useState(true);
    const [locale, setLocale] = useState(() => {
        const locale = (navigator.language || navigator.languages[0] || "en-GB")
            .split(/[-_]/)[0]
            .toLowerCase();
        return ["ru", "uk", "en"].includes(locale) ? locale : "en";
    });
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

    const setFoldersLastUpdatedAt = useCallback(
        (date = Date.now()) => {
            db.ref(`settings/${user.uid}`)
                .child("foldersLastUpdatedAt")
                .set(date);
        },
        [user]
    );

    const changeFolder = useCallback(
        (name, folder) => {
            db.ref(`settings/${user.uid}`)
                .child("folders")
                .child(name)
                .set(folder);
        },
        [user]
    );

    const [folders, setFolders] = useState({});
    const [filenamePattern, setFilenamePattern] = useState("{date} счёт");
    useEffect(() => {
        if (!user) {
            return;
        }
        db.ref(`settings/${user.uid}`).on("value", (snap) => {
            const value = snap.val();
            const folders = value?.folders || {};
            setFolders(folders);
            setFilenamePattern(value?.filenamePattern || "{date} счёт");

            if (value?.locale) {
                setLocale(value.locale);
            }
            setIsDBLoading(false);
        });
    }, [user]);

    useEffect(() => {
        if (!user) {
            return;
        }

        db.ref(`settings/${user.uid}`).once("value", async (snap) => {
            const value = snap.val();
            const folders = value?.folders || {};

            if (
                value?.foldersLastUpdatedAt &&
                value.foldersLastUpdatedAt + ms("2h") > Date.now()
            ) {
                return;
            }

            const foldersKeys = Object.keys(folders);

            if (!foldersKeys.length) {
                return;
            }

            await Promise.allSettled(
                foldersKeys.map(async (key) => {
                    const params = new URLSearchParams({
                        fields: ["id", "webViewLink", "name"].join(","),
                    });
                    const response = await fetch(
                        `https://www.googleapis.com/drive/v3/files/${
                            folders[key].id
                        }?${params.toString()}`,
                        {
                            headers: new Headers({
                                Authorization: `Bearer ${gapiToken}`,
                            }),
                        }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        if (response.status === 401) {
                            await signOut();
                        }
                        return;
                    }

                    if (folders[key].name === result.name) {
                        return;
                    }

                    changeFolder(key, {
                        id: result.id,
                        name: result.name,
                        url: result.webViewLink,
                    });
                })
            );
            setFoldersLastUpdatedAt();
        });
    }, [changeFolder, gapiToken, setFoldersLastUpdatedAt, signOut, user]);

    const changeLocale = useCallback(
        (locale) => {
            db.ref(`settings/${user.uid}`).child("locale").set(locale);
        },
        [user]
    );

    return (
        <AppContext.Provider
            value={{
                auth,
                changeFolder,
                changeLocale,
                db,
                filenamePattern,
                firebaseConfig,
                folders,
                gapiToken,
                isDBLoading,
                isLoading,
                locale,
                setFoldersLastUpdatedAt,
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
