import { EngineError } from "@openbible/engine-core";
import type { BibleVersion, CancellationToken } from "@openbible/engine-core";
import type { BiblePackageSource, InstallationObserver } from "@openbible/engine";

export interface HttpBiblePackageSourceOptions {
  /** API base exposing /api/bibles and /api/bibles/download/:version. */
  baseUrl?: string;
  /** Public directory containing version SQLite files, e.g. R2 /bibles. */
  packageBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

const R2_FILES: Record<string, string> = {
  acf: "ACF.sqlite",
  ara: "ARA.sqlite",
  arc: "ARC.sqlite",
  as21: "AS21.sqlite",
  jfaa: "JFAA.sqlite",
  kja: "KJA.sqlite",
  kjf: "KJF.sqlite",
  mens: "MENS.sqlite",
  naa: "NAA.sqlite",
  nbv: "NBV.sqlite",
  ntlh: "NTLH.sqlite",
  nvi: "NVI.sqlite",
  nvt: "NVT.sqlite",
  ol: "OL.sqlite",
  tb: "TB.sqlite",
  vfl: "VFL.sqlite",
};

const FALLBACK_VERSIONS: BibleVersion[] = [
  ["acf", "Almeida Corrigida Fiel"],
  ["ara", "Almeida Revista e Atualizada"],
  ["arc", "Almeida Revista e Corrigida"],
  ["as21", "Almeida Século 21"],
  ["jfaa", "João Ferreira de Almeida Atualizada"],
  ["kja", "King James Atualizada"],
  ["kjf", "King James Fiel"],
  ["mens", "The Message"],
  ["naa", "Nova Almeida Atualizada"],
  ["nbv", "Nova Bíblia Viva"],
  ["ntlh", "Nova Tradução na Linguagem de Hoje"],
  ["nvi", "Nova Versão Internacional"],
  ["nvt", "Nova Versão Transformadora"],
  ["ol", "O Livro"],
  ["tb", "Tradução Brasileira"],
  ["vfl", "Versão Fácil de Ler"],
].map(([id, name]) => ({ id, name, language: "pt-BR", totalBooks: 66 }));

const SQLITE_HEADER_TEXT = "SQLite format 3\0";
const SQLITE_HEADER = new TextEncoder().encode(SQLITE_HEADER_TEXT);

function headerValid(bytes: Uint8Array): boolean {
  if (bytes.length < SQLITE_HEADER.length) return false;
  for (let i = 0; i < SQLITE_HEADER.length; i++) if (bytes[i] !== SQLITE_HEADER[i]) return false;
  return true;
}

interface AbortBridge {
  signal: AbortSignal;
  dispose: () => void;
}

/** Bridges the portable CancellationToken to a DOM AbortSignal inside the adapter. */
function toAbortSignal(token?: CancellationToken): AbortBridge | undefined {
  if (!token) return undefined;
  const controller = new AbortController();
  let timer: ReturnType<typeof setInterval> | undefined;
  const check = () => {
    if (token.aborted && !controller.signal.aborted) controller.abort(token.reason);
  };
  check();
  if (!controller.signal.aborted) timer = setInterval(check, 25);
  return {
    signal: controller.signal,
    dispose: () => {
      if (timer !== undefined) clearInterval(timer);
    },
  };
}

export class HttpBiblePackageSource implements BiblePackageSource {
  private baseUrl: string | undefined;
  private packageBaseUrl: string | undefined;
  private fetchImpl: typeof fetch;

  constructor(options: HttpBiblePackageSourceOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/+$/, "");
    this.packageBaseUrl = options.packageBaseUrl?.replace(/\/+$/, "");
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
    const filename = R2_FILES[versionId.toLowerCase()];
    const directUrl = this.packageBaseUrl && filename ? `${this.packageBaseUrl}/${filename}` : undefined;
    const url = this.baseUrl
      ? `${this.baseUrl}/api/bibles/download/${encodeURIComponent(versionId)}`
      : directUrl;
    if (!url) {
      throw new EngineError("network_unavailable", "HttpBiblePackageSource: no package URL configured and no bytes injection");
    }

    const abortBridge = toAbortSignal(token);
    const signal = abortBridge?.signal;
    try {
    const urls = [
      url,
      directUrl,
    ].filter((candidate, index, all): candidate is string => Boolean(candidate) && all.indexOf(candidate) === index);
    let response: Response | undefined;
    let lastError: unknown;
    for (const candidate of urls) {
      try {
        const candidateResponse = await this.fetchImpl(candidate, {
          method: "GET",
          signal,
          headers: { Accept: "application/octet-stream, application/gzip, */*" },
        });
        if (candidateResponse.ok) {
          response = candidateResponse;
          break;
        }
        lastError = new Error(`${candidateResponse.status} ${candidateResponse.statusText}`);
      } catch (e) {
        if (token?.aborted || (e instanceof DOMException && e.name === "AbortError")) {
          throw new EngineError("cancelled", "Fetch cancelled", { cause: e });
        }
        lastError = e;
      }
    }

    if (!response) {
      if (lastError instanceof Error && lastError.message.startsWith("404 ")) {
        throw new EngineError("invalid_package", `Package not found: ${versionId}`, { cause: lastError });
      }
      throw new EngineError("network_unavailable", `Failed to fetch package: ${versionId}`, { cause: lastError });
    }

    if (token?.aborted) throw new EngineError("cancelled", "Operation cancelled after fetch");

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
    } finally {
      abortBridge?.dispose();
    }
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
