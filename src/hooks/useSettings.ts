import type { CompSettings } from "../types/CompSettings";

import { useEffect, useState, useRef } from "react";
import { Settings } from "../settings-manager/Settings";

const VERSION = 1;

/**
 * A hook to read and save user settings.
 * @returns [settings, saveSettings, resetToDefault]
 */
export function useSettings(): [CompSettings, (newSettings: CompSettings) => CompSettings, () => void] {
  const settingsObj = useRef(new Settings(VERSION));
  const [settings, setSettings] = useState(settingsObj.current.settings);

  useEffect(() => {
    settingsObj.current
      .readFromStore()
      .then((result) => {
        if (result.keepSettings) {
          settingsObj.current.settings = result;
          setSettings({ ...result });
        }
      })
      .catch(() => null);
  }, []);

  /**
   * Saves new settings to IndexedDB.
   * @param newSettings The object that will be saved to the database.
   * @returns
   */
  function saveSettings(newSettings: CompSettings) {
    setSettings({ ...newSettings });

    // Saves to database
    if (newSettings.keepSettings) {
      settingsObj.current.writeToStore(newSettings);
    } else {
      settingsObj.current.clearStore();
    }

    return newSettings;
  }

  /**
   * Resets Settings to default, also saving it to the database.
   */
  function resetToDefault() {
    const defaultSettings = settingsObj.current.getDefaultSettings();
    defaultSettings.keepSettings = settingsObj.current.settings.keepSettings;
    saveSettings(defaultSettings);
  }

  return [settings, saveSettings, resetToDefault];
}
