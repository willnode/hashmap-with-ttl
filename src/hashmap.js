import { Item, List } from 'linked-list';

/**
 * @template T
 */
export default class HashMap {
    #ttlData;
    /**
     * @type {Record<string, Item & ExtraItem>}
     */
    #hashData;
    #ttl;
    #capacity;
    #now;
    #length;

    /**
     * @typedef {{time: number, value: T, key: string}} ExtraItem
     */
    /**
     * @typedef {Object} HashmapOptions
     * @property {number} ttl - The maximum ttl of the queue.
     * @property {number} capacity - The maximum capacity of the queue.
     * @property {() => number} nowFn - The maximum capacity of the queue.
     */

    /**
     * Create a new HashMap with TTL instance.
     * @param {Partial<HashmapOptions>} options - HashMap options.
     */
    constructor({ ttl = 0, capacity = 0, nowFn = () => Date.now() } = {}) {
        this.#ttlData = new List();
        this.#hashData = {};
        this.#ttl = ttl;
        this.#capacity = capacity;
        this.#now = nowFn;
        this.#length = 0;
    }
    /**
     * @param {number} timestamp
     */
    #isExpired(timestamp) {
        if (this.#ttl == 0) {
            return false;
        }
        return timestamp + this.#ttl < this.#now()
    }
    length() {
        return this.#length;
    }
    /**
     * @param {string} key
     * @returns {T | undefined}
     */
    get(key) {
        let pointer;
        if (!(pointer = this.#hashData[key])) {
            return undefined;
        }
        if (this.#isExpired(pointer.time)) {
            return undefined;
        }
        return pointer.value;
    }
    /**
     * @param {string} key
     * @param {any} value
     */
    update(key, value) {
        /**
         * @type {Item & ExtraItem}
         */
        let pointer;
        if ((pointer = this.#hashData[key])) {
            pointer.value = value;
            this.touch(key);
            return;
        }
        if (this.#capacity > 0 && this.#length >= this.#capacity) {
            if (this.cleanup() == 0) {
                // purge oldest
                // @ts-ignore
                this.purge(this.#ttlData.head.key);
            }
        }
        pointer = Object.assign(new Item(), {
            time: this.#now(),
            value,
            key,
        });
        this.#ttlData.append(pointer);
        this.#hashData[key] = pointer;
        this.#length++;
    }
    /**
     * @param {string} key
     */
    touch(key) {
        let pointer;
        if ((pointer = this.#hashData[key])) {
            pointer.time = this.#now()
            pointer.detach();
            this.#ttlData.append(pointer);
        }
    }
    /**
     * @param {string} key
     */
    purge(key) {
        let pointer;
        if ((pointer = this.#hashData[key])) {
            let value = pointer.value;
            pointer.detach();
            delete this.#hashData[key];
            this.#length--;
            return value;
        }
        return undefined;
    }
    cleanup() {
        /**
         * @type {Item & ExtraItem | null}
         */
        // @ts-ignore
        let pointer = this.#ttlData.head;
        let removeCount = 0;
        while (pointer != null) {
            if (this.#isExpired(pointer.time)) {
                let next = pointer.next;
                pointer.detach();
                // @ts-ignore
                pointer = next;
                removeCount++;
            } else {
                pointer = null;
            }
        }
        this.#length -= removeCount;
        return removeCount;
    }
}