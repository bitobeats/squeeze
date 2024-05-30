import type { CompSettings } from "../types/CompSettings";

import { GeneralDB } from "../db-manager/GeneralDB";

/**
 * An object used to retrieve and store settings from IndexedDB.
 * It uses the GeneralDB object.
 */
export class Settings {
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

    this.#db = new GeneralDB("squeeze-general", version, [{ name: this.#STORE_NAME }]);
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
