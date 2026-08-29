import { HttpBiblePackageSource } from "@openbible/adapter-http";
import { createNodeAdapter, type NodeAdapter } from "@openbible/adapter-sqlite-node";
import { createBibleEngine, type BibleEngine, type Clock } from "@openbible/engine";
import type { ConsumerTuiConfig } from "./config.js";

export interface ConsumerTuiEngine extends BibleEngine {
  readonly adapter: NodeAdapter;
  close(): void;
}

export interface ConsumerTuiEngineOptions extends ConsumerTuiConfig {
  fetchImpl?: typeof fetch;
  clock?: Clock;
}

export function createConsumerTuiEngine(options: ConsumerTuiEngineOptions): ConsumerTuiEngine {
  const adapter = createNodeAdapter({
    dataDir: options.dataDir,
    registryPath: options.registryPath,
  });
  const packageSource = new HttpBiblePackageSource({
    baseUrl: options.baseUrl,
    packageBaseUrl: options.packageBaseUrl,
    fetchImpl: options.fetchImpl,
  });
  const engine = createBibleEngine({
    library: adapter.library,
    registry: adapter.registry,
    installer: adapter.installer,
    packageSource,
    clock: options.clock,
  });
  let closed = false;

  return {
    ...engine,
    adapter,
    close() {
      if (closed) return;
      closed = true;
      adapter.close();
    },
  };
}
