import React from "react";
import * as firebase from "firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

import { Box } from "@material-ui/core";

import { useAppContext } from "./context/appContext";
import logger from "./lib/logger";

const uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: ({ credential }) => {
            logger.info("Calling gapi.auth.setToken", credential.accessToken);
            window.gapi.auth.setToken(credential.accessToken);
            logger.info(
                "Calling gapi.auth.getToken",
                window.gapi.auth.getToken()
            );
            return false;
        },
    },
    signInFlow: "popup",
    signInOptions: [
        {
            customParameters: {
                // Forces account selection even when one account
                // is available.
                prompt: "select_account",
            },
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            scopes: ["https://www.googleapis.com/auth/drive"],
        },
    ],
    signInSuccessUrl: "/",
};

const Auth = () => {
    const { auth } = useAppContext();
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100vh"
        >
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
        </Box>
    );
};

export default Auth;
