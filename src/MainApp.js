import React, { useCallback } from "react";
import { useAppContext } from "./context/appContext";

const MainApp = () => {
    const { signOut, user } = useAppContext();

    const handleUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        const metadata = {
            mimeType: file.type,
            name: file.name,
            parents: ["1P4G3_GqhsB5oofQkbKX_AaHbj6sn_RtL"],
        };

        const form = new FormData();
        form.append(
            "metadata",
            new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        form.append("file", file);

        // const response = await fetch(
        //     "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        //     {
        //         body: form,
        //         headers: new Headers({
        //             Authorization: `Bearer ${
        //                 window.gapi.auth.getToken().access_token
        //             }`,
        //         }),
        //         method: "POST",
        //     }
        // );
    }, []);

    return (
        <>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleUpload}
            />
            <div>Hello, {user.displayName}</div>
            <button onClick={signOut}>Sign out</button>
        </>
    );
};

export default MainApp;
