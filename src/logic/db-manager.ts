/**
 * An object representing a custom IndexedDB Object Store.
 */
interface CustomObjectStore {
    name: string;
    options?: IDBObjectStoreParameters;
}

/**
 * An object used to ease the creating and managing of an IndexedDB database.
 */
export class GeneralDB {
    #name: string;
    #version: number;
    #objectStores: CustomObjectStore[];

    /**
     * Creates a database and the desired stores.
     * @param name The name of the database.
     * @param version The version of the database.
     * @param objectStores The object stores you want to create.
     */
    constructor(name: string, version: number, objectStores: CustomObjectStore[]) {
        this.#name = name;
        this.#version = version;
        this.#objectStores = objectStores;
    }

    /**
     * Gets the database instance. If it doesn't exist, creates one. If it is outdated, updates it.
     * @returns A Promise containing an IDBDatabase object.
     */
    #getDB() {
        return new Promise<IDBDatabase>((res, rej) => {
            const request = indexedDB.open(this.#name, this.#version);

            request.onerror = (e) => {
                rej(e);
            };

            request.onupgradeneeded = () => {
                const db = request.result;

                for (const objectStore of this.#objectStores) {
                    db.createObjectStore(objectStore.name, objectStore.options);
                }
            };

            request.onsuccess = () => {
                const db = request.result;
                res(db);
            };
        });
    }

    /**
     * Gets a specific store.
     * @param name The store's name.
     * @param mode The mode which the store will be opened in.
     * @returns A Promise containing the store.
     */
    async #getStore(name: string, mode: IDBTransactionMode) {
        const db = await this.#getDB();
        const transaction = db.transaction(name, mode);
        const store = transaction.objectStore(name);

        return store;
    }

    /**
     * Clears the whole Object Store.
     * @returns An empty Promise.
     */
    async clear(storeName: string) {
        return new Promise<null>((res, rej) => {
            this.#getStore(storeName, "readwrite").then((store) => {
                const request = store.clear();

                request.onerror = (e) => rej(e);
                request.onsuccess = () => res(null);
            });
        });
    }

    /**
     * Reads the value of a specific key from a specific store
     * @param query The key that will be used in the search.
     * @param storeName The name of the store to search in.
     * @returns The value from the key.
     */
    async read<Type>(query: IDBValidKey | IDBKeyRange, storeName: string): Promise<Type> {
        return new Promise((res, rej) => {
            this.#getStore(storeName, "readonly").then((store) => {
                const request = store.get(query);

                request.onerror = (e) => rej(e);
                request.onsuccess = () => {
                    res(request.result);
                };
            });
        });
    }

    /**
     * Reads all data from a specific store.
     * @param storeName The name of the store to read data from.
     * @returns A Promise containing all the data of a store.
     */
    async readAll(storeName: string) {
        return new Promise((res, rej) => {
            this.#getStore(storeName, "readonly").then((store) => {
                const request = store.getAll();

                request.onerror = (e) => rej(e);
                request.onsuccess = () => {
                    res(request.result);
                };
            });
        });
    }

    /**
     * Writes to the database.
     * @param obj The object to be written.
     * @param id The ID of the object that will be written to the database.
     * @param storeName The storeName to which it will be written to.
     * @returns An empty Promise.
     */
    async write<Type>(obj: Type, id: string, storeName: string): Promise<null> {
        return new Promise((res, rej) => {
            this.#getStore(storeName, "readwrite").then((store) => {
                const request = store.add(obj, id);

                request.onerror = (e) => rej(e);
                request.onsuccess = () => {
                    res(null);
                };
            });
        });
    }

    /**
     * Updates the value of a specific key in a specific store.
     * @param obj The new value.
     * @param key The key that will have it's value updated.
     * @param storeName The store's name.
     * @returns A promise after the proccess is completed.
     */
    async update(obj: object, key: string, storeName: string): Promise<null> {
        return new Promise((res, rej) => {
            this.#getStore(storeName, "readwrite").then((store) => {
                const request = store.put(obj, key);

                request.onerror = (e) => rej(e);
                request.onsuccess = () => {
                    res(null);
                };
            });
        });
    }
}
