import type { CompSettings, TransparentBackgroundColor } from "../../logic/settings-manager";
import { useEffect, memo } from "react";
import {
    Typography,
    Divider,
    Container,
    Stack,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    Box,
    ThemeProvider,
    createTheme,
    InputAdornment,
    Button,
    Switch,
} from "@mui/material";

import ImageQualitySlider from "./ImageQualitySlider";

import { greenButtonTheme, blackTheme } from "../../themes";

const settingsTheme = createTheme({
    typography: {
        allVariants: {
            fontFamily: "Roboto",
        },
        h3: {
            fontSize: 20,
            fontWeight: 400,
            textTransform: "uppercase",
        },
        subtitle1: {
            color: "rgba(0, 0, 0, 0.6);",
            fontSize: 14,
        },
    },
});

export interface SettingsProps {
    handleClose: (canClose: boolean) => void;
    settings: CompSettings;
    setCanClose: React.Dispatch<React.SetStateAction<boolean>>;
    sliderValue: number;
    setSliderValue: React.Dispatch<React.SetStateAction<number>>;
    settWidth: string;
    setSettWidth: React.Dispatch<React.SetStateAction<string>>;
    settHeight: string;
    setSettHeight: React.Dispatch<React.SetStateAction<string>>;
    settPrefix: string;
    setSettPrefix: React.Dispatch<React.SetStateAction<string>>;
    settSufix: string;
    setSettSufix: React.Dispatch<React.SetStateAction<string>>;
    transparentBackgroundColor: TransparentBackgroundColor;
    setTransparentBackgroundColor: React.Dispatch<React.SetStateAction<TransparentBackgroundColor>>;
    keepSettings: boolean;
    setKeepSettings: React.Dispatch<React.SetStateAction<boolean>>;
    resetToDefault: () => void;
}

function Settings({
    handleClose,
    setCanClose,
    sliderValue,
    setSliderValue,
    settWidth,
    setSettWidth,
    settHeight,
    setSettHeight,
    settPrefix,
    setSettPrefix,
    settSufix,
    setSettSufix,
    transparentBackgroundColor,
    setTransparentBackgroundColor,
    keepSettings,
    setKeepSettings,
    resetToDefault,
}: SettingsProps) {
    const widthError = isNaN(Number(settWidth));
    const heightError = isNaN(Number(settHeight));

    useEffect(() => {
        if (widthError || heightError) {
            setCanClose!(false);
        } else {
            setCanClose!(true);
        }
    }, [settWidth, settHeight]);

    return (
        <ThemeProvider theme={settingsTheme}>
            <Container maxWidth={"xs"} sx={{ marginBottom: 3 }}>
                <Box sx={{ marginBottom: 4, marginTop: 3 }}>
                    <Typography variant="h3">Resize</Typography>
                    <Divider sx={{ marginBottom: 2, marginTop: 1 }} />
                    <Stack direction={"row"} gap="15px">
                        <TextField
                            id="settings-width"
                            label="max width"
                            error={widthError}
                            variant="filled"
                            value={settWidth === "0" ? "" : settWidth}
                            onChange={(e) => setSettWidth(e.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            }}
                        />

                        <TextField
                            id="settings-height"
                            label="max height"
                            variant="filled"
                            error={heightError}
                            value={settHeight === "0" ? "" : settHeight}
                            onChange={(e) => setSettHeight(e.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            }}
                        />
                    </Stack>
                </Box>

                <Box sx={{ marginBottom: 4, marginTop: 3 }}>
                    <Typography variant="h3">Rename</Typography>
                    <Divider sx={{ marginBottom: 2, marginTop: 1 }} />
                    <Stack direction={"row"} gap="15px">
                        <TextField
                            id="settings-prefix"
                            label="prefix"
                            variant="filled"
                            value={settPrefix}
                            onChange={(e) => setSettPrefix(e.target.value)}
                        />

                        <TextField
                            id="settings-sufix"
                            label="sufix"
                            variant="filled"
                            value={settSufix}
                            onChange={(e) => setSettSufix(e.target.value)}
                        />
                    </Stack>
                </Box>

                <Box sx={{ marginBottom: 4, marginTop: 3 }}>
                    <Typography variant="h3">Quality</Typography>
                    <Typography variant="subtitle1">Higher quality also means larger files.</Typography>
                    <Divider sx={{ marginBottom: 2, marginTop: 1 }} />
                    <ImageQualitySlider
                        sliderValue={sliderValue}
                        sliderOnChange={(e, v) => setSliderValue(Number(v))}
                        textOnChange={(e) => setSliderValue(Number(e.target.value))}
                    />
                </Box>

                <Box sx={{ marginBottom: 4, marginTop: 3 }}>
                    <Typography variant="h3">Convert Transparency</Typography>
                    <Divider sx={{ marginBottom: 1, marginTop: 1 }} />
                    <ThemeProvider theme={blackTheme}>
                        <RadioGroup
                            row
                            value={transparentBackgroundColor}
                            onChange={(e) =>
                                setTransparentBackgroundColor(e.target.value === "white" ? "white" : "black")
                            }>
                            <FormControlLabel value="black" control={<Radio />} label="black" />
                            <FormControlLabel value="white" control={<Radio />} label="white" />
                        </RadioGroup>
                    </ThemeProvider>
                </Box>

                <ThemeProvider theme={greenButtonTheme}>
                    <Container
                        disableGutters
                        sx={{
                            justifyContent: "space-between",
                            display: "flex",
                            marginBottom: "env(safe-area-inset-bottom)",
                        }}>
                        <Box sx={{ marginBottom: 0, marginTop: 0 }}>
                            <ThemeProvider theme={blackTheme}>
                                <Box justifyContent={"end"} display={"flex"}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={keepSettings}
                                                onChange={() => {
                                                    setKeepSettings((val) => !val);
                                                }}
                                            />
                                        }
                                        label="Keep settings"
                                        labelPlacement="end"
                                    />
                                </Box>
                            </ThemeProvider>
                        </Box>

                        <Stack direction={"row"} spacing={2}>
                            <ThemeProvider theme={blackTheme}>
                                <Button variant="outlined" onClick={resetToDefault}>
                                    Clear
                                </Button>
                            </ThemeProvider>

                            <Button
                                disabled={widthError || heightError}
                                variant="contained"
                                onClick={() => handleClose(!widthError || !heightError)}>
                                Save
                            </Button>
                        </Stack>
                    </Container>
                </ThemeProvider>
            </Container>
        </ThemeProvider>
    );
}

export default memo(Settings);
