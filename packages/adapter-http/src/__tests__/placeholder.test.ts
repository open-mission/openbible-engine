import { describe, it, expect, vi } from "vitest";
import { HttpBiblePackageSource } from "../http-source.js";
import { createAraFixture } from "@openbible/engine-testing";

function makeFakeFetch(bytes: Uint8Array, ok = true, status = 200): typeof fetch {
  return (async (_url: string | URL | Request, _init?: RequestInit) => {
    return {
      ok,
      status,
      statusText: ok ? "OK" : "Not Found",
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === "content-length") return String(bytes.length);
          if (name.toLowerCase() === "content-encoding") return null;
          return null;
        },
      },
      body: null,
      arrayBuffer: async () => bytes.buffer.slice(bytes.byteLength ? bytes.byteOffset : 0, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
      json: async () => [],
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

describe("HttpBiblePackageSource", () => {
  it("listAvailable fallback when no baseUrl", async () => {
    const src = new HttpBiblePackageSource({});
    const list = await src.listAvailable();
    expect(list.length).toBeGreaterThan(0);
  });

  it("listAvailable fetches from http when baseUrl given", async () => {
    const fakeData = [{ id: "ara", name: "ARA" }];
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => fakeData,
      arrayBuffer: async () => new ArrayBuffer(0),
      body: null,
    })) as unknown as typeof fetch;
    const src = new HttpBiblePackageSource({ baseUrl: "https://example.com", fetchImpl });
    const list = await src.listAvailable();
    expect(list[0].id).toBe("ara");
    expect(fetchImpl).toHaveBeenCalled();
  });

  it("fetchPackage returns bytes with progress", async () => {
    const fixture = createAraFixture();
    const fetchImpl = makeFakeFetch(fixture.bytes);
    const src = new HttpBiblePackageSource({ baseUrl: "https://example.com", fetchImpl });
    const observer = { onProgress: vi.fn() };
    const bytes = await src.fetchPackage("ara", undefined, observer);
    expect(bytes.length).toBe(fixture.bytes.length);
    expect(observer.onProgress).toHaveBeenCalled();
  });

  it("fetchPackage supports cancellation", async () => {
    const fixture = createAraFixture();
    const fetchImpl = makeFakeFetch(fixture.bytes);
    const src = new HttpBiblePackageSource({ baseUrl: "https://example.com", fetchImpl });
    const controller = new AbortController();
    controller.abort();
    await expect(src.fetchPackage("ara", controller.signal)).rejects.toThrow();
  });

  it("fetchPackage validates header", async () => {
    const bad = new TextEncoder().encode("BAD HEADER!!!!!!invalid");
    const fetchImpl = makeFakeFetch(bad);
    const src = new HttpBiblePackageSource({ baseUrl: "https://example.com", fetchImpl });
    await expect(src.fetchPackage("ara")).rejects.toThrow();
  });
});
