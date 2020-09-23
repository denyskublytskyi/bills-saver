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
    const { signOut, user } = useAppContext();
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

    const [date, setDate] = useState(new Date());

    const handleUploadClick = useCallback(
        (category) => () => inputRefs[category]?.current?.click(),
        [inputRefs]
    );
    const handleUpload = useCallback(
        (category) => async (e) => {
            if (!config[category]) {
                return;
            }

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

            await fetch(
                "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
                {
                    body: form,
                    headers: new Headers({
                        Authorization: `Bearer ${
                            window.gapi.auth.getToken().access_token
                        }`,
                    }),
                    method: "POST",
                }
            );
        },
        [date]
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
                                    <BatteryCharging60Icon fontSize="large" />
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
                                endIcon={<WavesIcon fontSize="large" />}
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
                                endIcon={<HomeIcon fontSize="large" />}
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
                                    href={`https://github.com/${process.env.REACT_APP_REPOSITORY}/commit/${process.env.REACT_APP_SHA}`}
                                >
                                    {process.env.REACT_APP_SHA}
                                </a>
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default MainApp;
