import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONSUMER_ROOT = path.join(os.homedir(), ".local", "share", "openbible-engine-tui");
const DEFAULT_DATA_DIR = path.join(CONSUMER_ROOT, "bibles");
const DEFAULT_REGISTRY_PATH = path.join(CONSUMER_ROOT, "registry.sqlite");

export interface ConsumerTuiConfig {
  baseUrl?: string;
  packageBaseUrl?: string;
  dataDir: string;
  registryPath: string;
}

function optionalUrl(value: string | undefined, name: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${name} must be a valid HTTP(S) URL`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${name} must use HTTP or HTTPS`);
  }
  return parsed.toString().replace(/\/$/, "");
}

function isolatedPath(value: string, name: string): string {
  const resolved = path.resolve(value);
  const legacyRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../open-bible");
  const legacyTui = path.join(legacyRoot, "apps", "tui");
  const isInside = (candidate: string, root: string): boolean =>
    candidate === root || candidate.startsWith(`${root}${path.sep}`);

  if (isInside(resolved, legacyRoot) || isInside(resolved, legacyTui)) {
    throw new Error(`${name} cannot point to the legacy Open Bible project`);
  }
  return resolved;
}

export function resolveConsumerTuiConfig(env: NodeJS.ProcessEnv = process.env): ConsumerTuiConfig {
  return {
    baseUrl: optionalUrl(env.OPENBIBLE_TUI_API_URL, "OPENBIBLE_TUI_API_URL"),
    packageBaseUrl: optionalUrl(env.OPENBIBLE_TUI_PACKAGE_BASE_URL, "OPENBIBLE_TUI_PACKAGE_BASE_URL"),
    dataDir: isolatedPath(env.OPENBIBLE_TUI_DATA_DIR ?? DEFAULT_DATA_DIR, "OPENBIBLE_TUI_DATA_DIR"),
    registryPath: isolatedPath(env.OPENBIBLE_TUI_REGISTRY_PATH ?? DEFAULT_REGISTRY_PATH, "OPENBIBLE_TUI_REGISTRY_PATH"),
  };
}
