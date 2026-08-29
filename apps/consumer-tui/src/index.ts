import { fileURLToPath } from "node:url";
import path from "node:path";
import { createCliRenderer, type CliRendererConfig } from "@opentui/core";
import { createElement } from "react";
import { createRoot } from "@opentui/react";
import { createConsumerTuiEngine, type ConsumerTuiEngine, type ConsumerTuiEngineOptions } from "./engine.js";
import { resolveConsumerTuiConfig, type ConsumerTuiConfig } from "./config.js";
import { ScriptureLibraryService } from "./services/scripture-library.js";
import { App } from "./ui/App.js";

export interface StartConsumerTuiOptions {
  config?: ConsumerTuiConfig;
  engine?: ConsumerTuiEngine;
  fetchImpl?: typeof fetch;
  renderer?: CliRendererConfig;
}

export async function startConsumerTui(options: StartConsumerTuiOptions = {}): Promise<void> {
  const config = options.config ?? resolveConsumerTuiConfig();
  const engineOptions: ConsumerTuiEngineOptions = {
    ...config,
    fetchImpl: options.fetchImpl,
  };
  const engine = options.engine ?? createConsumerTuiEngine(engineOptions);
  const service = new ScriptureLibraryService(engine);
  const renderer = await createCliRenderer({
    ...options.renderer,
    exitOnCtrlC: false,
    onDestroy: () => service.close(),
  });
  createRoot(renderer).render(createElement(App, { engine, onQuit: () => renderer.destroy() }));
  renderer.start();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void startConsumerTui().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
