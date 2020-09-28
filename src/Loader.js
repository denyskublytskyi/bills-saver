import React from "react";

import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";

const Loader = () => (
    <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        width="100vw"
        position="absolute"
        top="0"
        left="0"
    >
        <CircularProgress />
    </Box>
);

export default Loader;
