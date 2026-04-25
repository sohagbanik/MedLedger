import { describe, it, expect } from "vitest";
import { cache, cacheKey } from "@/lib/cache";

describe("cacheKey", () => {
  it("builds a deterministic key from method and args", () => {
    expect(cacheKey("is_registered", "GABC123")).toBe("is_registered:GABC123");
    expect(cacheKey("get_records", "GABC", "GXYZ")).toBe(
      "get_records:GABC:GXYZ"
    );
    expect(cacheKey("get_patient")).toBe("get_patient");
  });
});

describe("MemoryCache", () => {
  it("stores and retrieves a value", () => {
    cache.clear();
    cache.set("test-key", { name: "John" });
    expect(cache.get("test-key")).toEqual({ name: "John" });
  });

  it("returns undefined for missing keys", () => {
    cache.clear();
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  it("returns undefined for expired entries", () => {
    cache.clear();
    // Set with 0ms TTL → already expired
    cache.set("expired-key", "value", 0);
    expect(cache.get("expired-key")).toBeUndefined();
  });

  it("deletes a key", () => {
    cache.clear();
    cache.set("del-key", 42);
    expect(cache.get("del-key")).toBe(42);
    cache.delete("del-key");
    expect(cache.get("del-key")).toBeUndefined();
  });

  it("clears all entries", () => {
    cache.clear();
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.size).toBe(2);
    cache.clear();
    expect(cache.size).toBe(0);
  });
});
