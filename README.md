# `hashmap-with-ttl`

A hashmap implementation with maximum capacity and time-to-live limit.

The idea is primilarily for caching, just like Redis which also has time-to-live data config but you also wish to avoid it. 

In another word, if you think you need Redis for caching data, you might not need to.

The performance penalty should be negliglibe compared with using plain HashMap, as all implementation methods is O(1). We internally use linked-list structure to manage time-to-live data.

This library is implemented using ESM imports and private methods. Node 16 is required.

## Usage

Using `capacity` option:

```js
import { HashMap } from "hashmap-with-ttl";

const map = new HashMap({ capacity: 2 });
map.update("foo", "bar");
map.update("fuu", "baz");
map.update("fuu", "bah"); // "baz" is replaced at this point
map.update("faa", "bal"); // "foo" is gone at this point
expect(t.length()).toBe(2);
expect(t.get("foo")).toBe(undefined);
expect(t.purge("fuu")).toBe("bah"); // "fuu" is manually purged
expect(t.get("fuu")).toBe(undefined);
expect(t.length()).toBe(1);
```


Using `ttl` option:

```js
import { HashMap } from "hashmap-with-ttl";


let mockTime = 0; // In this example, we replace Date.now() 
                 // with this mocked value. In real world if you want to
                // say, the hashmap cache should be invalid after an hour, 
               // then you set it like: new HashMap({ ttl: 3600 * 1000 })
const t = new HashMap({ ttl: 2000, nowFn: () => mockTime });
expect(t.length()).toBe(0);
t.update("foo", "bar");
mockTime += 1000; // 1 second elapsed
t.update("fuu", "baz");
mockTime += 1000; // 1 second elapsed
t.update("faa", "bal");
mockTime += 1000; // 1 second elapsed

// at this point this key is invalid
expect(t.get("foo")).toBe(undefined);
// but actually the data still there!

// The cleanup() function erases the
// expiring data from memory
expect(t.cleanup()).toBe(1); 
expect(t.length()).toBe(2);
// Ideally you want to call cleanup()
// With setInterval... say every single day
```

You can set `capacity` and `ttl` both at the same time 👍
