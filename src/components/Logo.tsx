import { Typography } from "@mui/material";

function Logo() {
    return (
        <Typography fontSize={30} fontFamily={'"Baloo 2"'} sx={{ flexGrow: 1 }}>
            <a href={window.location.href} style={{ textDecoration: "none", color: "white" }}>
                squeeze
            </a>
        </Typography>
    );
}

export default Logo;
