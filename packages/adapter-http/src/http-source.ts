import { EngineError } from "@openbible/engine-core";
import type { BibleVersion, CancellationToken } from "@openbible/engine-core";
import type { BiblePackageSource, InstallationObserver } from "@openbible/engine";

export interface HttpBiblePackageSourceOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

const FALLBACK_VERSIONS: BibleVersion[] = [
  { id: "ara", name: "ARA", language: "pt-BR", totalBooks: 66 },
  { id: "nvi", name: "NVI", language: "pt-BR", totalBooks: 66 },
  { id: "acf", name: "ACF", language: "pt-BR", totalBooks: 66 },
];

const SQLITE_HEADER_TEXT = "SQLite format 3\0";
const SQLITE_HEADER = new TextEncoder().encode(SQLITE_HEADER_TEXT);

function headerValid(bytes: Uint8Array): boolean {
  if (bytes.length < SQLITE_HEADER.length) return false;
  for (let i = 0; i < SQLITE_HEADER.length; i++) if (bytes[i] !== SQLITE_HEADER[i]) return false;
  return true;
}

/** Bridges the portable CancellationToken to a DOM AbortSignal inside the adapter. */
function toAbortSignal(token?: CancellationToken): AbortSignal | undefined {
  if (!token) return undefined;
  const controller = new AbortController();
  if (token.aborted) controller.abort(token.reason);
  return controller.signal;
}

export class HttpBiblePackageSource implements BiblePackageSource {
  private baseUrl: string | undefined;
  private fetchImpl: typeof fetch;

  constructor(options: HttpBiblePackageSourceOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/+$/, "");
    this.fetchImpl =
      options.fetchImpl ??
      (typeof fetch !== "undefined"
        ? fetch.bind(globalThis)
        : (async () => {
            throw new Error("fetch not available");
          }) as unknown as typeof fetch);
  }

  async listAvailable(): Promise<BibleVersion[]> {
    if (!this.baseUrl) return FALLBACK_VERSIONS.map((v) => ({ ...v }));
    try {
      const res = await this.fetchImpl(`${this.baseUrl}/api/bibles`, { method: "GET" });
      if (!res.ok) return FALLBACK_VERSIONS.map((v) => ({ ...v }));
      const data = (await res.json()) as unknown;
      if (Array.isArray(data) && data.every((v) => typeof (v as BibleVersion).id === "string" && typeof (v as BibleVersion).name === "string")) {
        return (data as BibleVersion[]).map((v) => ({ ...v }));
      }
      return FALLBACK_VERSIONS.map((v) => ({ ...v }));
    } catch {
      return FALLBACK_VERSIONS.map((v) => ({ ...v }));
    }
  }

  async fetchPackage(
    versionId: string,
    token?: CancellationToken,
    observer?: InstallationObserver,
  ): Promise<Uint8Array> {
    if (token?.aborted) throw new EngineError("cancelled", "Operation cancelled", { cause: token.reason });
    if (!this.baseUrl) {
      throw new EngineError("network_unavailable", "HttpBiblePackageSource: no baseUrl configured and no bytes injection");
    }

    const signal = toAbortSignal(token);
    const url = `${this.baseUrl}/api/bibles/download/${encodeURIComponent(versionId)}`;

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "GET",
        signal,
        headers: { Accept: "application/octet-stream, application/gzip, */*" },
      });
    } catch (e) {
      if (token?.aborted || (e instanceof DOMException && e.name === "AbortError")) {
        throw new EngineError("cancelled", "Fetch cancelled", { cause: e });
      }
      throw new EngineError("network_unavailable", `Failed to fetch package: ${versionId}`, { cause: e });
    }

    if (token?.aborted) throw new EngineError("cancelled", "Operation cancelled after fetch");
    if (!response.ok) {
      if (response.status === 404) throw new EngineError("invalid_package", `Package not found: ${versionId}`);
      throw new EngineError("network_unavailable", `Failed to download ${versionId}: ${response.status} ${response.statusText}`);
    }

    const encoding = response.headers.get("content-encoding")?.toLowerCase() ?? "";
    const isGzipped = encoding.includes("gzip");
    const totalHeader = response.headers.get("content-length");
    const totalBytes = totalHeader ? Number.parseInt(totalHeader, 10) : undefined;

    let bytes: Uint8Array;
    try {
      if (response.body && typeof response.body.getReader === "function" && observer) {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        observer.onProgress({ versionId, stage: "receiving", receivedBytes: 0, totalBytes });
        while (true) {
          if (token?.aborted) {
            try {
              await reader.cancel();
            } catch {
              // ignore
            }
            throw new EngineError("cancelled", "Operation cancelled during streaming");
          }
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            try {
              observer.onProgress({ versionId, stage: "receiving", receivedBytes: received, totalBytes });
            } catch {
              // ignore observer error
            }
          }
        }
        bytes = concat(chunks);
      } else {
        if (observer) observer.onProgress({ versionId, stage: "receiving", receivedBytes: 0, totalBytes });
        const buf = await response.arrayBuffer();
        bytes = new Uint8Array(buf);
        if (observer) {
          observer.onProgress({ versionId, stage: "receiving", receivedBytes: bytes.length, totalBytes: totalBytes ?? bytes.length });
        }
      }
    } catch (e) {
      if (e instanceof EngineError) throw e;
      if (token?.aborted || (e instanceof DOMException && e.name === "AbortError")) {
        throw new EngineError("cancelled", "Fetch cancelled", { cause: e });
      }
      throw new EngineError("network_unavailable", "Failed to read response body", { cause: e });
    }

    if (token?.aborted) throw new EngineError("cancelled", "Operation cancelled after body");

    if (isGzipped && !headerValid(bytes)) {
      try {
        const DS = (globalThis as { DecompressionStream?: typeof DecompressionStream }).DecompressionStream;
        if (DS) {
          const ds = new DS("gzip");
          const writer = ds.writable.getWriter();
          const chunks: Uint8Array[] = [];
          const reader = ds.readable.getReader();
          await writer.write(bytes as unknown as BufferSource);
          await writer.close();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value as Uint8Array);
          }
          bytes = concat(chunks);
        }
      } catch {
        // keep original bytes; header validation below will fail
      }
    }

    if (!headerValid(bytes)) {
      throw new EngineError("invalid_package", "Invalid package: SQLite header mismatch after fetch");
    }
    if (token?.aborted) throw new EngineError("cancelled", "Operation cancelled");

    return bytes;
  }
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((acc, c) => acc + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}
