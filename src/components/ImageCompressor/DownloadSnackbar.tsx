import { useEffect, memo } from "react";
import { Button, IconButton, Snackbar, createTheme, ThemeProvider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface DownloadSnackbarProps {
    isOpen: boolean;
    handleDownload: () => void;
    handleClose: () => void;
}

const downloadButtonTheme = createTheme({
    palette: {
        primary: {
            main: "rgba(85, 211, 154, 1)",
        },
    },
});

function DownloadSnackbar({ isOpen, handleDownload, handleClose }: DownloadSnackbarProps) {
    useEffect(() => {
        return handleClose();
    }, []);

    const action = (
        <>
            <ThemeProvider theme={downloadButtonTheme}>
                <Button onClick={handleDownload}>Download</Button>
            </ThemeProvider>

            <IconButton onClick={handleClose} sx={{ color: "white" }}>
                <CloseIcon fontSize="small" />
            </IconButton>
        </>
    );

    return (
        <Snackbar
            open={isOpen}
            message="Download ready!"
            autoHideDuration={null}
            action={action}
            onClose={handleClose}
            sx={{
                marginBottom: "env(safe-area-inset-bottom)",
            }}
        />
    );
}

export default memo(DownloadSnackbar);
