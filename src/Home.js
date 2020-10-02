import React, { useCallback, useState, useRef, useEffect } from "react";
import format from "date-fns/format";
import { useRouteMatch, useHistory } from "react-router-dom";
import localeRu from "date-fns/locale/ru";

import Box from "@material-ui/core/Box";

import BatteryCharging60Icon from "@material-ui/icons/BatteryCharging60";
import WavesIcon from "@material-ui/icons/Waves";
import HomeIcon from "@material-ui/icons/Home";

import { useAppContext } from "./context/appContext";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { DatePicker } from "@material-ui/pickers";
import Grid from "@material-ui/core/Grid";
import withStyles from "@material-ui/core/styles/withStyles";
import { yellow, blue, green } from "@material-ui/core/colors";
import Container from "@material-ui/core/Container";
import Snackbar from "@material-ui/core/Snackbar";
import Slide from "@material-ui/core/Slide";
import Alert from "@material-ui/lab/Alert";
import { CircularProgress } from "@material-ui/core";

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

const Home = () => {
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

    const { signOut, gapiToken, folders, filenamePattern } = useAppContext();

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
            const folder = folders?.[category];
            if (!folder) {
                return;
            }

            setIsLoading({ ...isLoading, [category]: true });

            const file = e.target.files[0];
            const metadata = {
                mimeType: file.type,
                name: filenamePattern.replace(
                    "{date}",
                    format(date, "MM.yyyy", {
                        locale: localeRu,
                    })
                ),
                parents: [folder.id],
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
        [date, filenamePattern, folders, gapiToken, isLoading, signOut]
    );

    const location = useRouteMatch();
    const history = useHistory();

    useEffect(() => {
        const category = location?.params?.category;
        if (category && inputRefs[category]) {
            handleUploadClick(category)();
            history.replace("/");
        }
    }, [handleUploadClick, history, inputRefs, location]);

    return (
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
                            <Typography variant="h6">Electricity</Typography>
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
    );
};

export default Home;
