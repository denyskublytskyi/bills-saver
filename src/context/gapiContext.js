import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import Script from "react-load-script";
import logger from "../lib/logger";
import { useAppContext } from "./appContext";

const GapiContext = createContext({
    gapi: null,
});

const GapiProvider = ({ children }) => {
    const [gapi, setGapi] = useState(null);
    const { firebaseConfig, user } = useAppContext();

    const initGapi = useCallback(() => {
        window.gapi.load("client:auth2", async () => {
            logger.info("Google API client is loaded");
        });
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        window.gapi.client
            .init({
                apiKey: firebaseConfig.apiKey,
                clientId: firebaseConfig.clientID,
                discoveryDocs: [
                    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                ],
                scope: "https://www.googleapis.com/auth/drive",
            })
            .then(() => {
                logger.info("Google API is initialized");
                setGapi(window.gapi);
            });
    }, [user, firebaseConfig.apiKey, firebaseConfig.clientID, setGapi]);

    return (
        <GapiContext.Provider value={{ gapi }}>
            <Script url="https://apis.google.com/js/api.js" onLoad={initGapi} />
            {children}
        </GapiContext.Provider>
    );
};

const useGapi = () => useContext(GapiContext);

export { useGapi, GapiProvider };
