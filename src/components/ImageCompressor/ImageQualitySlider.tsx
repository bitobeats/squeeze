import { memo } from "react";
import { Grid, Slider, TextField, ThemeProvider, createTheme } from "@mui/material";

const sliderTheme = createTheme({
    palette: {
        primary: {
            main: "#000",
        },
    },
});

interface CompProps {
    sliderValue: number;
    sliderOnChange: (event: Event, value: number | number[], activeThumb: number) => void;
    textOnChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
}

function ImageQualitySlider({ sliderValue, sliderOnChange, textOnChange }: CompProps) {
    return (
        <Grid container gap={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Grid item xs={8}>
                <ThemeProvider theme={sliderTheme}>
                    <Slider value={sliderValue} onChange={sliderOnChange} step={5} min={10}></Slider>
                </ThemeProvider>
            </Grid>

            <Grid item xs={2}>
                <TextField size="small" value={sliderValue} onChange={textOnChange} />
            </Grid>
        </Grid>
    );
}

export default memo(ImageQualitySlider);
