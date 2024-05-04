import { test, expect } from "bun:test";
import HashMap from "./hashmap.js";

test("update & remove test", () => {
    const t = new HashMap();
    expect(t.length()).toBe(0);
    expect(t.get("foo")).toBe(undefined);
    t.update("foo", "bar");
    expect(t.length()).toBe(1);
    expect(t.get("foo")).toBe("bar");
    t.update("foo", "baz");
    expect(t.length()).toBe(1);
    expect(t.get("foo")).toBe("baz");
    expect(t.purge("foo")).toBe("baz");
    expect(t.purge("foo")).toBe(undefined);
    expect(t.length()).toBe(0);
})

test("capacity test", () => {
    const t = new HashMap({ capacity: 2 });
    expect(t.length()).toBe(0);
    t.update("foo", "bar");
    t.update("fuu", "baz");
    t.update("faa", "bal");
    expect(t.length()).toBe(2);
    expect(t.get("foo")).toBe(undefined);
})


test("time-to-live test", () => {
    let mockTime = 0;
    const t = new HashMap({ ttl: 2, nowFn: () => mockTime });
    expect(t.length()).toBe(0);
    t.update("foo", "bar"); // 0
    mockTime++;
    t.update("fuu", "baz"); // 1
    mockTime++;
    t.update("faa", "bal"); // 2
    mockTime++;
    expect(t.cleanup()).toBe(1);
    expect(t.length()).toBe(2);
    expect(t.get("foo")).toBe(undefined);
    t.touch("fuu"); // 3
    mockTime++;
    mockTime++;
    expect(t.cleanup()).toBe(1);
    expect(t.get("faa")).toBe(undefined);
})

