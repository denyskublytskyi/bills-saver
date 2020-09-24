import React, { useCallback, useState, useRef } from "react";
import format from "date-fns/format";
import localeRu from "date-fns/locale/ru";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import BatteryCharging60Icon from "@material-ui/icons/BatteryCharging60";
import WavesIcon from "@material-ui/icons/Waves";
import HomeIcon from "@material-ui/icons/Home";

import { useAppContext } from "./context/appContext";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useTheme from "@material-ui/core/styles/useTheme";
import IconButton from "@material-ui/core/IconButton";
import { DatePicker } from "@material-ui/pickers";
import Grid from "@material-ui/core/Grid";
import withStyles from "@material-ui/core/styles/withStyles";
import { yellow, blue, green } from "@material-ui/core/colors";
import Container from "@material-ui/core/Container";
import Snackbar from "@material-ui/core/Snackbar";
import Slide from "@material-ui/core/Slide";
import Alert from "@material-ui/lab/Alert";
import { CircularProgress } from "@material-ui/core";

const config = {
    electricity: {
        folderId: "1TFFEbrEDGhSH1bEQ7TbVYZW7WlzZv7oZ",
        format: "{date} счёт",
    },
    home: {
        folderId: "1-pPomzn7y8Lm0LsrsnxEL01R9eeZ-zkb",
        format: "{date} счёт",
    },
    water: {
        folderId: "1P4G3_GqhsB5oofQkbKX_AaHbj6sn_RtL",
        format: "{date} счёт",
    },
};

const ElectricityButton = withStyles({
    root: {
        backgroundColor: yellow[100],
    },
})(Button);

const WaterButton = withStyles({
    root: {
        backgroundColor: blue[100],
    },
})(Button);

const HomeButton = withStyles({
    root: {
        backgroundColor: green[100],
    },
})(Button);

const MainApp = () => {
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState({});

    const handleMessageClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setMessage(null);
        setError(null);
    };

    const { signOut, user, gapiToken } = useAppContext();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

    const waterInputRef = useRef();
    const electricityInputRef = useRef();
    const homeInputRef = useRef();

    const inputRefs = {
        electricity: electricityInputRef,
        home: homeInputRef,
        water: waterInputRef,
    };

    const [date, setDate] = useState(() => {
        const value = new Date();
        value.setDate(1);
        value.setMonth(value.getMonth() - 1);

        return value;
    });

    const handleUploadClick = useCallback(
        (category) => () => inputRefs[category]?.current?.click(),
        [inputRefs]
    );
    const handleUpload = useCallback(
        (category) => async (e) => {
            if (!config[category]) {
                return;
            }

            setIsLoading({ ...isLoading, [category]: true });

            const file = e.target.files[0];
            const metadata = {
                mimeType: file.type,
                name: config[category].format.replace(
                    "{date}",
                    format(date, "MM.yyyy", {
                        locale: localeRu,
                    })
                ),
                parents: [config[category].folderId],
            };

            const form = new FormData();
            form.append(
                "metadata",
                new Blob([JSON.stringify(metadata)], {
                    type: "application/json",
                })
            );
            form.append("file", file);

            if (!gapiToken) {
                await signOut();
            }

            const params = new URLSearchParams({
                fields: ["id", "webViewLink", "name"].join(","),
                uploadType: "multipart",
            });

            try {
                const response = await fetch(
                    `https://www.googleapis.com/upload/drive/v3/files?${params.toString()}`,
                    {
                        body: form,
                        headers: new Headers({
                            Authorization: `Bearer ${gapiToken}`,
                        }),
                        method: "POST",
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        await signOut();
                        return;
                    }
                    throw new Error(result?.error?.message);
                }

                setMessage(
                    <>
                        Photo is uploaded{" "}
                        <a
                            href={result.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {result.name}
                        </a>
                    </>
                );
            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading({ ...isLoading, [category]: false });
            }
        },
        [date, gapiToken, isLoading, signOut]
    );

    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    <Box flexGrow={1} />

                    <Typography variant="subtitle1">
                        {user.displayName}
                    </Typography>

                    <Box ml={2}>
                        <Avatar
                            variant="rounded"
                            alt={user.displayName}
                            src={user.photoURL}
                        >
                            {user.displayName
                                .split(" ")
                                .map((str) => str.charAt(0).toUpperCase())
                                .join("")}
                        </Avatar>
                    </Box>
                    <Box ml={isDesktop ? 2 : 1}>
                        {isDesktop ? (
                            <Button
                                startIcon={<ExitToAppIcon />}
                                color="inherit"
                                onClick={signOut}
                            >
                                Sign out
                            </Button>
                        ) : (
                            <IconButton onClick={signOut} color="inherit">
                                <ExitToAppIcon />
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <Box mt={7} p={2} pt={4}>
                <Container maxWidth="xs">
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <DatePicker
                                inputVariant="outlined"
                                fullWidth
                                openTo="year"
                                views={["year", "month"]}
                                label="Month"
                                disableFuture
                                onChange={setDate}
                                value={date}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <ElectricityButton
                                fullWidth
                                variant="contained"
                                endIcon={
                                    isLoading.electricity ? (
                                        <CircularProgress />
                                    ) : (
                                        <BatteryCharging60Icon fontSize="large" />
                                    )
                                }
                                onClick={handleUploadClick("electricity")}
                            >
                                <Box
                                    p={5}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Typography variant="h6">
                                        Electricity
                                    </Typography>
                                </Box>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleUpload("electricity")}
                                    hidden
                                    ref={electricityInputRef}
                                />
                            </ElectricityButton>
                        </Grid>
                        <Grid item xs={12}>
                            <WaterButton
                                fullWidth
                                variant="contained"
                                endIcon={
                                    isLoading.water ? (
                                        <CircularProgress />
                                    ) : (
                                        <WavesIcon fontSize="large" />
                                    )
                                }
                                onClick={handleUploadClick("water")}
                            >
                                <Box
                                    p={5}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Typography variant="h6">Water</Typography>
                                </Box>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleUpload("water")}
                                    hidden
                                    ref={waterInputRef}
                                />
                            </WaterButton>
                        </Grid>
                        <Grid item xs={12}>
                            <HomeButton
                                fullWidth
                                variant="contained"
                                endIcon={
                                    isLoading.home ? (
                                        <CircularProgress />
                                    ) : (
                                        <HomeIcon fontSize="large" />
                                    )
                                }
                                onClick={handleUploadClick("home")}
                            >
                                <Box
                                    p={5}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Typography variant="h6">Home</Typography>
                                </Box>
                            </HomeButton>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleUpload("home")}
                                hidden
                                ref={homeInputRef}
                            />
                        </Grid>
                        <Grid item container xs={12} justify="center">
                            <Typography variant="caption">
                                Bills saver{" "}
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://github.com/${process.env.REACT_APP_REPOSITORY}/commit/${process.env.REACT_APP_SHA}`}
                                >
                                    {process.env.REACT_APP_SHA}
                                </a>
                            </Typography>
                        </Grid>
                        <Snackbar
                            TransitionComponent={Slide}
                            open={Boolean(message) || Boolean(error)}
                            onClose={handleMessageClose}
                            autoHideDuration={6000}
                        >
                            <Alert
                                severity={error ? "error" : "success"}
                                onClose={handleMessageClose}
                            >
                                {error || message}
                            </Alert>
                        </Snackbar>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default MainApp;
