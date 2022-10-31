import { useEffect, useState, useRef } from "react";

import { GeneralDB } from "./db-manager";

const VERSION = 1;

/**
 * The background color that will be used if image has transparent background.
 */
export type TransparentBackgroundColor = "black" | "white";

/**
 * Image Compressor's settings.
 */
export interface CompSettings {
    quality: number;
    width: number;
    height: number;
    prefix: string;
    sufix: string;
    transparentBackgroundColor: TransparentBackgroundColor;
    keepSettings: boolean;
}

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
            .catch((e) => null);
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

/**
 * An object used to retrieve and store settings from IndexedDB.
 * It uses the GeneralDB object.
 */
class Settings {
    #STORE_NAME: string;

    version: number;
    settings: CompSettings;
    #defaultSettings: CompSettings;
    #db: GeneralDB;

    /**
     * Creates or uses an IndexedDB store named "settings" with the passed version.
     * @param version
     */
    constructor(version: number) {
        this.#STORE_NAME = "settings";
        this.version = version;

        this.#defaultSettings = {
            quality: 85,
            width: 0,
            height: 0,
            prefix: "",
            sufix: "",
            transparentBackgroundColor: "black",
            keepSettings: false,
        };
        this.settings = { ...this.#defaultSettings };

        this.#db = new GeneralDB("General", version, [{ name: this.#STORE_NAME }]);
    }

    /**
     *
     * @returns The default settings
     */
    getDefaultSettings() {
        return this.#defaultSettings;
    }

    /**
     * Save passed settings in the store.
     * @param settings Settings to be saved.
     */
    async writeToStore(settings: CompSettings) {
        try {
            await this.#db.read<CompSettings>("settings", this.#STORE_NAME);
            await this.#db.update(settings, "settings", this.#STORE_NAME);
            this.settings = settings;
        } catch {
            await this.#db.write(settings, "settings", this.#STORE_NAME);
        }
    }

    /**
     *
     * @returns Settings found in the store
     */
    async readFromStore() {
        try {
            const result = await this.#db.read<CompSettings>("settings", this.#STORE_NAME);
            return result;
        } catch {
            return this.#defaultSettings;
        }
    }

    /**
     *
     * @returns An empty Promise
     */
    async clearStore() {
        await this.#db.clear(this.#STORE_NAME);
        return;
    }
}
