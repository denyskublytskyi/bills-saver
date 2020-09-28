import React, { useState, useCallback } from "react";
import Script from "react-load-script";
import capitalize from "lodash/capitalize";

import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import FolderIcon from "@material-ui/icons/Folder";
import EditIcon from "@material-ui/icons/Edit";

import logger from "./lib/logger";
import { useAppContext } from "./context/appContext";
import Loader from "./Loader";

const Settings = () => {
    const { firebaseConfig, gapiToken, db, user, folders } = useAppContext();
    const [isPickerLoading, setIsPickerLoading] = useState(true);

    const onPickerApiLoad = useCallback(() => {
        logger.info("Google Picker is loaded");
        setIsPickerLoading(false);
    }, []);

    const handleGapiLoad = useCallback(() => {
        logger.info("Google API is loaded. Loading Google picker...");
        window.gapi.load("picker", { callback: onPickerApiLoad });
    }, [onPickerApiLoad]);

    const editFolder = useCallback(
        (category) => () => {
            // https://developers.google.com/picker/docs/reference#view-id
            const googleViewId = window.google.picker.ViewId.FOLDERS;
            const view = new window.google.picker.DocsView(
                googleViewId
            ).setSelectFolderEnabled(true);

            new window.google.picker.PickerBuilder()
                .setAppId(firebaseConfig.appId)
                .setOAuthToken(gapiToken)
                .addView(view)
                .setCallback((result) => {
                    if (
                        result[window.google.picker.Response.ACTION] !==
                        window.google.picker.Action.PICKED
                    ) {
                        return;
                    }
                    const folder =
                        result[window.google.picker.Response.DOCUMENTS][0];

                    const newFolder = {
                        id: folder[window.google.picker.Document.ID],
                        name: folder[window.google.picker.Document.NAME],
                        url: folder[window.google.picker.Document.URL],
                    };

                    db.ref(`settings/${user.uid}`)
                        .child("folders")
                        .child(category)
                        .set(newFolder);
                })
                .build()
                .setVisible(true);
        },
        [db, firebaseConfig.appId, gapiToken, user.uid]
    );

    return (
        <Container maxWidth="xs">
            {folders !== undefined && !isPickerLoading ? (
                <>
                    <Typography variant="caption" color="textSecondary">
                        Folders
                    </Typography>
                    <List>
                        {["electricity", "water", "home"].map((category) => (
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <FolderIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={capitalize(category)}
                                    secondary={
                                        folders?.[category] ? (
                                            <a
                                                href={folders?.[category]?.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {folders?.[category]?.name}
                                            </a>
                                        ) : (
                                            "-"
                                        )
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={editFolder(category)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="caption">
                        <Box textAlign="center">
                            Bills saver{" "}
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://github.com/${process.env.REACT_APP_REPOSITORY}/commit/${process.env.REACT_APP_SHA}`}
                            >
                                {process.env.REACT_APP_SHA}
                            </a>
                        </Box>
                    </Typography>
                </>
            ) : (
                <Loader />
            )}
            <Script
                url="https://apis.google.com/js/api.js"
                onLoad={handleGapiLoad}
            />
        </Container>
    );
};

export default Settings;
