import { describe, it, expect, vi } from "vitest";
import { HttpBiblePackageSource } from "../http-source.js";

const SQLITE_HEADER = "SQLite format 3\0";
function validHeaderBytes(tail = "0123456789abcdef"): Uint8Array {
  return new TextEncoder().encode(SQLITE_HEADER + tail);
}

function makeFakeFetch(bytes: Uint8Array, ok = true, status = 200): typeof fetch {
  return (async () => {
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
      arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
      json: async () => [],
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

describe("HttpBiblePackageSource", () => {
  // SPECSFY: US-001 FR-001 NFR-001 AC-001
  it("fetchPackage downloads the version file from a direct package base URL", async () => {
    const fetchImpl = vi.fn(makeFakeFetch(validHeaderBytes()));
    const src = new HttpBiblePackageSource({ packageBaseUrl: "https://r2.example/bibles", fetchImpl });

    await src.fetchPackage("nvi");

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://r2.example/bibles/NVI.sqlite",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("falls back from the API proxy to the direct package URL", async () => {
    const direct = makeFakeFetch(validHeaderBytes());
    const fetchImpl = vi.fn().mockRejectedValueOnce(new Error("proxy offline")).mockImplementationOnce(direct);
    const src = new HttpBiblePackageSource({
      baseUrl: "https://openbible-prod.vercel.app",
      packageBaseUrl: "https://r2.example/bibles",
      fetchImpl,
    });

    await src.fetchPackage("ara");

    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      "https://openbible-prod.vercel.app/api/bibles/download/ara",
      "https://r2.example/bibles/ARA.sqlite",
    ]);
  });

  it("lists the complete R2 fallback catalog when the API is not configured", async () => {
    const src = new HttpBiblePackageSource({ packageBaseUrl: "https://r2.example/bibles" });
    const ids = (await src.listAvailable()).map((version) => version.id);

    expect(ids).toEqual(expect.arrayContaining(["acf", "ara", "nvi", "ntlh", "vfl"]));
    expect(ids.length).toBe(16);
  });

  it("listAvailable fallback when no baseUrl", async () => {
    const src = new HttpBiblePackageSource({});
    expect((await src.listAvailable()).length).toBeGreaterThan(0);
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

  it("fetchPackage returns bytes and reports progress", async () => {
    const bytes = validHeaderBytes();
    const src = new HttpBiblePackageSource({ baseUrl: "https://example.com", fetchImpl: makeFakeFetch(bytes) });
    const observer = { onProgress: vi.fn() };
    const got = await src.fetchPackage("ara", undefined, observer);
    expect(got.length).toBe(bytes.length);
    expect(observer.onProgress).toHaveBeenCalled();
  });

  it("fetchPackage honours a cancelled portable token", async () => {
    const src = new HttpBiblePackageSource({ baseUrl: "https://example.com", fetchImpl: makeFakeFetch(validHeaderBytes()) });
    await expect(src.fetchPackage("ara", { aborted: true, reason: "stop" })).rejects.toMatchObject({ code: "cancelled" });
  });

  it("fetchPackage rejects a non-SQLite payload", async () => {
    const bad = new TextEncoder().encode("BAD HEADER!!!!!!not sqlite");
    const src = new HttpBiblePackageSource({ baseUrl: "https://example.com", fetchImpl: makeFakeFetch(bad) });
    await expect(src.fetchPackage("ara")).rejects.toMatchObject({ code: "invalid_package" });
  });

  it("no baseUrl is network_unavailable", async () => {
    const src = new HttpBiblePackageSource({});
    await expect(src.fetchPackage("ara")).rejects.toMatchObject({ code: "network_unavailable" });
  });
});
