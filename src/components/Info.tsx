import { Typography, Container } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

function Info() {
    return (
        <>
            <Typography variant="h1">
                <b>Proper</b> image sizes, <br></br>
                but with great <b>quality.</b>
            </Typography>
            <Typography variant="h2" marginBottom={10} marginTop={10}>
                Compress multiple images at once. <b>It's free.</b>
            </Typography>
            <Container
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignContent: "center",
                    alignItems: "center",
                    padding: 0,
                    flexDirection: { xs: "row-reverse", md: "row" },
                }}>
                <LockIcon
                    sx={{
                        fontSize: { xs: "clamp(30px, 15vw, 100px)", md: 150 },
                        color: "white"
                    }}
                />
                <Typography
                    variant="h3"
                    marginTop="auto"
                    marginBottom="auto"
                    sx={{
                        marginLeft: { xs: 0, md: 10 },
                    }}>
                    Worried about privacy? Images never leave your device since Squeeze does all the work locally.
                </Typography>
            </Container>
        </>
    );
}

export default Info;
