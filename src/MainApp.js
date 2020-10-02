import React, { useCallback, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useLocation, useHistory } from "react-router-dom";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import { useAppContext } from "./context/appContext";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useTheme from "@material-ui/core/styles/useTheme";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import MenuIcon from "@material-ui/icons/Menu";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SettingsIcon from "@material-ui/icons/Settings";
import HomeIcon from "@material-ui/icons/Home";

import Settings from "./Settings";
import Home from "./Home";
import Loader from "./Loader";

const MainApp = () => {
    const { signOut, user } = useAppContext();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuOpen = useCallback(() => {
        setIsMenuOpen(true);
    }, []);

    const handleMenuClose = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    const location = useLocation();
    const history = useHistory();

    const goTo = useCallback(
        (path) => () => {
            setIsMenuOpen(false);
            if (location.pathname === path) {
                return;
            }
            history.push(path);
        },
        [history, location.pathname]
    );

    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleMenuOpen}
                    >
                        <MenuIcon />
                    </IconButton>
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
            <Drawer anchor="top" open={isMenuOpen} onClose={handleMenuClose}>
                <List component="nav">
                    <ListItem
                        button
                        selected={location.pathname === "/"}
                        onClick={goTo("/")}
                    >
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItem>
                    <ListItem
                        button
                        selected={location.pathname === "/settings"}
                        onClick={goTo("/settings")}
                    >
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItem>
                </List>
            </Drawer>
        </>
    );
};

export default () => {
    const { isLoading, isDBLoading } = useAppContext();
    return (
        <Box mt={7} p={2} pt={4}>
            <Router>
                <MainApp />
                <Switch>
                    <Route exact path="/add/:category">
                        {!isDBLoading && !isLoading ? <Home /> : <Loader />}
                    </Route>
                    <Route exact path="/settings">
                        {!isDBLoading && !isLoading ? <Settings /> : <Loader />}
                    </Route>
                    <Route path="/">
                        {!isDBLoading && !isLoading ? <Home /> : <Loader />}
                    </Route>
                </Switch>
            </Router>
        </Box>
    );
};
