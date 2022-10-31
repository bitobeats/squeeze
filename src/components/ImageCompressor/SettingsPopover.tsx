import type { CompSettings } from "../../logic/settings-manager";
import { useState, useEffect, memo } from "react";
import { Popover, Box, SwipeableDrawer, useTheme, useMediaQuery, styled } from "@mui/material";
import { grey } from "@mui/material/colors";

import Settings from "./Settings";

const iOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

const Puller = styled(Box)(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: theme.palette.mode === "light" ? grey[300] : grey[900],
    borderRadius: 3,
    position: "absolute",
    top: 8,
    left: "calc(50% - 15px)",
}));

interface SettingsPopoverProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    settings: CompSettings;
    popoverAnchor: HTMLButtonElement | null;
    saveSettings: (newSettings: CompSettings) => CompSettings;
    resetToDefault: () => void;
}
function SettingsPopover({
    isOpen,
    setIsOpen,
    settings,
    saveSettings,
    popoverAnchor,
    resetToDefault,
}: SettingsPopoverProps) {
    const [canClose, setCanClose] = useState(true);
    const id = isOpen ? "settings-popover" : undefined;
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

    // Slider
    const [sliderValue, setSliderValue] = useState(settings.quality);

    // Settings Popover
    const [settWidth, setSettWidth] = useState(String(settings.width));
    const [settHeight, setSettHeight] = useState(String(settings.height));
    const [settPrefix, setSettPrefix] = useState(String(settings.prefix));
    const [settSufix, setSettSufix] = useState(String(settings.sufix));
    const [transparentBackgroundColor, setTransparentBackgroundColor] = useState(settings.transparentBackgroundColor);
    const [keepSettings, setKeepSettings] = useState(settings.keepSettings);

    useEffect(() => {
        setSettWidth(String(settings.width));
        setSettHeight(String(settings.height));
        setSettPrefix(String(settings.prefix));
        setSettSufix(String(settings.sufix));
        setTransparentBackgroundColor(settings.transparentBackgroundColor);
        setKeepSettings(settings.keepSettings);
    }, [settings]);

    function handleClose() {
        canClose ? setIsOpen(false) : true;

        if (canClose) {
            setIsOpen(false);
            saveSettings({
                quality: sliderValue,
                width: Number(settWidth),
                height: Number(settHeight),
                prefix: settPrefix,
                sufix: settSufix,
                transparentBackgroundColor: transparentBackgroundColor,
                keepSettings: keepSettings,
            });
        }
    }

    return isDesktop ? (
        <Popover
            id={id}
            open={isOpen}
            anchorEl={popoverAnchor}
            onClose={handleClose}
            anchorOrigin={{
                horizontal: "left",
                vertical: "bottom",
            }}>
            <Settings
                handleClose={handleClose}
                settings={settings}
                setCanClose={setCanClose}
                settWidth={settWidth}
                setSettWidth={setSettWidth}
                settHeight={settHeight}
                setSettHeight={setSettHeight}
                settPrefix={settPrefix}
                setSettPrefix={setSettPrefix}
                settSufix={settSufix}
                setSettSufix={setSettSufix}
                sliderValue={sliderValue}
                setSliderValue={setSliderValue}
                transparentBackgroundColor={transparentBackgroundColor}
                setTransparentBackgroundColor={setTransparentBackgroundColor}
                keepSettings={keepSettings}
                setKeepSettings={setKeepSettings}
                resetToDefault={resetToDefault}
            />
        </Popover>
    ) : (
        <SwipeableDrawer
            onOpen={() => {}}
            open={isOpen}
            onClose={handleClose}
            anchor={"bottom"}
            disableBackdropTransition={!iOS}
            disableDiscovery={iOS}
            sx={{
                paddingBottom: "env(safe-area-inset-bottom)",
            }}>
            <Puller />
            <Settings
                handleClose={handleClose}
                settings={settings}
                setCanClose={setCanClose}
                settWidth={settWidth}
                setSettWidth={setSettWidth}
                settHeight={settHeight}
                setSettHeight={setSettHeight}
                settPrefix={settPrefix}
                setSettPrefix={setSettPrefix}
                settSufix={settSufix}
                setSettSufix={setSettSufix}
                sliderValue={sliderValue}
                setSliderValue={setSliderValue}
                transparentBackgroundColor={transparentBackgroundColor}
                setTransparentBackgroundColor={setTransparentBackgroundColor}
                keepSettings={keepSettings}
                setKeepSettings={setKeepSettings}
                resetToDefault={resetToDefault}
            />
        </SwipeableDrawer>
    );
}

export default memo(SettingsPopover);
