import React from "react";
import * as firebase from "firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

import { useAppContext } from "./context/appContext";

const uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: () => false,
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
    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
};

export default Auth;
