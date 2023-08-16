import { Button, IconButton, Snackbar, createTheme, ThemeProvider, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRegisterSW } from "virtual:pwa-register/react";

const downloadButtonTheme = createTheme({
    palette: {
        primary: {
            main: "rgba(85, 211, 154, 1)",
        },
    },
});

export default function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered() {
            // eslint-disable-next-line prefer-template
        },
        onRegisterError() {},
    });

    const handleClick = async () => {
        await updateServiceWorker(true);
        handleClose();
    };
    const handleClose = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };
    const popupMessage = () => {
        let message = "";
        if (offlineReady) {
            message = "Ready to work offline!";
        } else {
            message = "New update available!";
        }
        return message;
    };

    const action = (
        <>
            {needRefresh && (
                <ThemeProvider theme={downloadButtonTheme}>
                    <Button onClick={handleClick}>Install</Button>
                </ThemeProvider>
            )}

            <IconButton onClick={handleClose} sx={{ color: "white" }}>
                <CloseIcon fontSize="small" />
            </IconButton>
        </>
    );

    return (
        <Snackbar
            open={offlineReady || needRefresh}
            message={needRefresh ? popupMessage() : null}
            autoHideDuration={null}
            action={action}
            onClose={handleClose}
            sx={{
                marginBottom: "env(safe-area-inset-bottom)",
            }}>
            {offlineReady ? (
                <Alert onClose={handleClose} severity="success">
                    {popupMessage()}
                </Alert>
            ) : undefined}
        </Snackbar>
    );
}
