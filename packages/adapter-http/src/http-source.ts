import { EngineError } from "@openbible/engine-core";
import type { BibleVersion } from "@openbible/engine-core";
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

export class HttpBiblePackageSource implements BiblePackageSource {
  private baseUrl: string | undefined;
  private fetchImpl: typeof fetch;

  constructor(options: HttpBiblePackageSourceOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/+$/, "");
    // Use injected fetch or global fetch if available
    this.fetchImpl =
      options.fetchImpl ??
      (typeof fetch !== "undefined" ? fetch.bind(globalThis) : (async () => {
        throw new Error("fetch not available");
      }) as unknown as typeof fetch);
  }

  async listAvailable(): Promise<BibleVersion[]> {
    if (!this.baseUrl) {
      return FALLBACK_VERSIONS.map((v) => ({ ...v }));
    }
    try {
      const res = await this.fetchImpl(`${this.baseUrl}/api/bibles`, { method: "GET" });
      if (!res.ok) return FALLBACK_VERSIONS.map((v) => ({ ...v }));
      const data = (await res.json()) as unknown;
      // Expect array of BibleVersion
      if (Array.isArray(data)) {
        const versions = data as BibleVersion[];
        // basic validation
        if (versions.every((v) => typeof v.id === "string" && typeof v.name === "string")) {
          return versions.map((v) => ({ ...v }));
        }
      }
      // Fallback if shape unexpected
      return FALLBACK_VERSIONS.map((v) => ({ ...v }));
    } catch {
      // Network failure => fallback static list
      return FALLBACK_VERSIONS.map((v) => ({ ...v }));
    }
  }

  async fetchPackage(versionId: string, signal?: AbortSignal, observer?: InstallationObserver): Promise<Uint8Array> {
    if (signal?.aborted) throw new EngineError("cancelled", "Operation cancelled", { cause: signal.reason });

    if (!this.baseUrl) {
      throw new EngineError("network_unavailable", "HttpBiblePackageSource: no baseUrl configured and no bytes injection");
    }

    const url = `${this.baseUrl}/api/bibles/download/${encodeURIComponent(versionId)}`;

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "GET",
        signal,
        headers: { Accept: "application/octet-stream, application/gzip, */*" },
      });
    } catch (e) {
      if (signal?.aborted || (e instanceof DOMException && e.name === "AbortError")) {
        throw new EngineError("cancelled", "Fetch cancelled", { cause: e });
      }
      throw new EngineError("network_unavailable", `Failed to fetch package: ${versionId}`, { cause: e });
    }

    if (signal?.aborted) throw new EngineError("cancelled", "Operation cancelled after fetch");

    if (!response.ok) {
      if (response.status === 404) throw new EngineError("invalid_package", `Package not found: ${versionId}`);
      throw new EngineError("network_unavailable", `Failed to download ${versionId}: ${response.status} ${response.statusText}`);
    }

    // Handle gzipped vs raw: check Content-Encoding or Content-Type
    const encoding = response.headers.get("content-encoding")?.toLowerCase() ?? "";
    const isGzipped = encoding.includes("gzip");

    // Progress handling
    const totalHeader = response.headers.get("content-length");
    const totalBytes = totalHeader ? Number.parseInt(totalHeader, 10) : undefined;

    // If body is available as stream, we can report progress chunk by chunk.
    // For simplicity, support both arrayBuffer and stream.
    let bytes: Uint8Array;

    try {
      if (response.body && typeof response.body.getReader === "function" && observer) {
        // Stream with progress
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        observer.onProgress({ versionId, stage: "receiving", receivedBytes: 0, totalBytes });
        while (true) {
          if (signal?.aborted) {
            try { await reader.cancel(); } catch { /* ignore */ }
            throw new EngineError("cancelled", "Operation cancelled during streaming");
          }
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            try {
              observer.onProgress({ versionId, stage: "receiving", receivedBytes: received, totalBytes });
            } catch { /* ignore observer error */ }
          }
        }
        const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
        bytes = new Uint8Array(totalLen);
        let offset = 0;
        for (const c of chunks) {
          bytes.set(c, offset);
          offset += c.length;
        }
      } else {
        // Non-streaming fallback
        if (observer) observer.onProgress({ versionId, stage: "receiving", receivedBytes: 0, totalBytes });
        const buf = await response.arrayBuffer();
        bytes = new Uint8Array(buf);
        if (observer) observer.onProgress({ versionId, stage: "receiving", receivedBytes: bytes.length, totalBytes: totalBytes ?? bytes.length });
      }
    } catch (e) {
      if (e instanceof EngineError) throw e;
      if (signal?.aborted || (e instanceof DOMException && e.name === "AbortError")) {
        throw new EngineError("cancelled", "Fetch cancelled", { cause: e });
      }
      throw new EngineError("network_unavailable", "Failed to read response body", { cause: e });
    }

    if (signal?.aborted) throw new EngineError("cancelled", "Operation cancelled after body");

    // Handle gzipped payload if needed: we assume bytes may be gzipped if encoding indicates.
    // For milestone, if isGzipped, try to decompress via DecompressionStream if available, else validate raw header after.
    // Simple: if header invalid and isGzipped, attempt to decompress with global DecompressionStream if exists.
    if (isGzipped && !headerValid(bytes)) {
      // Try to decompress
      try {
        // Use DecompressionStream if available (Node 22+ has it)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const DS = (globalThis as any).DecompressionStream as unknown as typeof DecompressionStream | undefined;
        if (DS) {
          const ds = new DS("gzip");
          const writer = ds.writable.getWriter();
          const reader = ds.readable.getReader();
          writer.write(bytes as unknown as BufferSource);
          writer.close();
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value as Uint8Array);
          }
          const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
          const decompressed = new Uint8Array(totalLen);
          let off = 0;
          for (const c of chunks) { decompressed.set(c, off); off += c.length; }
          bytes = decompressed;
        }
      } catch {
        // Decompression failed, keep original bytes for header validation to throw
      }
    }

    // Validate header
    if (!headerValid(bytes)) {
      throw new EngineError("invalid_package", "Invalid package: SQLite header mismatch after fetch");
    }

    if (signal?.aborted) throw new EngineError("cancelled", "Operation cancelled");

    return bytes;
  }
}
