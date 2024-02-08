import type { CompSettings } from "../../types/CompSettings";

import { useState, useRef, memo } from "react";

import { Grid, Button, ThemeProvider } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";

import SettingsPopover from "./SettingsPopover";

import { greenButtonTheme } from "../../themes";

import { useSettings } from "../../hooks/useSettings";

interface CompActionsProps {
  getDeliverableImages: (image: File[], settings: CompSettings) => void;
  importedFiles: File[] | null;
}

function CompActions({ getDeliverableImages, importedFiles }: CompActionsProps) {
  // Settings
  const [settings, saveSettings, resetToDefault] = useSettings();

  // Settings Popover
  const settingsAnchor = useRef<HTMLButtonElement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <Grid
      container
      gap="20px"
      sx={{
        justifyContent: { xs: "center" },
        alignItems: { xs: "center" },
        paddingTop: { xs: 3 },
      }}>
      <Grid item>
        <Button
          startIcon={<SettingsIcon />}
          ref={settingsAnchor}
          onClick={() => {
            setIsSettingsOpen(true);
          }}
          sx={{ color: "white" }}>
          Settings
        </Button>
        <SettingsPopover
          isOpen={isSettingsOpen}
          setIsOpen={setIsSettingsOpen}
          settings={settings}
          saveSettings={saveSettings}
          popoverAnchor={settingsAnchor.current}
          resetToDefault={resetToDefault}
        />
      </Grid>
      <Grid item>
        <ThemeProvider theme={greenButtonTheme}>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => getDeliverableImages(importedFiles!, settings)}>
            {" "}
            Make it happen!{" "}
          </Button>
        </ThemeProvider>
      </Grid>
    </Grid>
  );
}

export default memo(CompActions);
