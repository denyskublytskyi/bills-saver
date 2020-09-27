import React, { useMemo } from "react";
import * as firebase from "firebase/app";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

import { Box } from "@material-ui/core";

import { useAppContext } from "./context/appContext";

const Auth = () => {
    const { auth, setGapiToken } = useAppContext();

    const uiConfig = useMemo(
        () => ({
            callbacks: {
                signInSuccessWithAuthResult: ({ credential }) => {
                    setGapiToken(credential.accessToken);

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
        }),
        [setGapiToken]
    );

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
