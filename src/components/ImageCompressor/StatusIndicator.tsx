import { Modal, CircularProgress, Box, Typography, Grid } from "@mui/material";

const boxStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};

interface StatusIndicatorProps {
    isOpen: boolean;
    totalTasks: number;
    currentTask: number;
    elapsedTime: string;
}

function getPercent(number: number, total: number) {
    return (100 * number) / total;
}

function StatusIndicator({ isOpen, currentTask, totalTasks, elapsedTime }: StatusIndicatorProps) {
    return (
        <Modal open={isOpen}>
            <Box sx={boxStyle}>
                <Grid display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <Typography color={"black"} variant="h3">
                        Working on your files!
                    </Typography>
                    <Typography color={"black"} variant="h5">
                        {currentTask.toString()} of {totalTasks.toString()} completed...
                    </Typography>

                    <CircularProgress variant="determinate" value={getPercent(currentTask, totalTasks)} />
                    <Typography color={"black"} variant="h6">
                        Elapsed time: {elapsedTime}
                    </Typography>
                </Grid>
            </Box>
        </Modal>
    );
}

export default StatusIndicator;
