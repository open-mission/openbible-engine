"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createWebAdapter, type WebAdapter } from "@openbible/adapter-sqlite-web";
import { createBibleEngine, type BibleEngine } from "@openbible/engine";
import { HttpBiblePackageSource } from "@openbible/adapter-http";

export type EngineStatus = "loading" | "ready" | "error";

interface EngineState {
  engine: BibleEngine | null;
  adapter: WebAdapter | null;
  status: EngineStatus;
  message?: string;
  refresh: () => void;
}

const DEFAULT_STATE: EngineState = { engine: null, adapter: null, status: "loading", refresh: () => undefined };
const DEFAULT_BIBLE_API_URL = "https://openbible-prod.vercel.app";
const DEFAULT_BIBLE_PACKAGE_BASE_URL = "https://pub-2e657f1c9c644712ad9474513a7ad79b.r2.dev/bibles";
const EngineContext = createContext<EngineState>(DEFAULT_STATE);

/**
 * Client-side provider que instancia o adapter Web (Worker + SQLite WASM + OPFS)
 * e compõe a engine uma única vez. O Worker/OPFS não existem no servidor, por
 * isso a inicialização acontece em um efeito (após o hidratar).
 */
export function BibleEngineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EngineState>(DEFAULT_STATE);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let mounted = true;
    let adapter: WebAdapter | undefined;
    (async () => {
      try {
        adapter = await createWebAdapter({
          // Next cannot execute a package Worker chunk with its server-side
          // helper imports. The build copies the official package bundle to
          // this stable app asset path; the WASM URL remains an explicit
          // adapter override, as supported by the public API.
          workerUrl: "/engine-worker/worker.js",
          wasmUrl: "/engine-worker/sqlite3.wasm",
        });
        await adapter.reconcile();
        const engine = createBibleEngine({
          library: adapter.library,
          registry: adapter.registry,
          installer: adapter.installer,
          packageSource: new HttpBiblePackageSource({
            baseUrl: process.env.NEXT_PUBLIC_BIBLE_API_URL ?? DEFAULT_BIBLE_API_URL,
            packageBaseUrl: process.env.NEXT_PUBLIC_BIBLE_BUCKET_URL ?? DEFAULT_BIBLE_PACKAGE_BASE_URL,
          }),
        });
        if (mounted) {
          setState({ engine, adapter, status: "ready", refresh: () => setGeneration((value) => value + 1) });
        } else {
          await adapter.close();
        }
      } catch (error) {
        if (mounted) {
          const code = error instanceof Error && "code" in error ? String(error.code) : "storage_unavailable";
          setState({
            engine: null,
            adapter: null,
            status: "error",
            message: `${code}: ${error instanceof Error ? error.message : "Não foi possível abrir o armazenamento local."}`,
            refresh: () => setGeneration((value) => value + 1),
          });
        }
      }
    })();
    return () => {
      mounted = false;
      void adapter?.close();
    };
  }, [generation]);

  return <EngineContext.Provider value={state}>{children}</EngineContext.Provider>;
}

export function useBibleEngine(): EngineState {
  return useContext(EngineContext);
}
