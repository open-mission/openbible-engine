import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const appRoot = resolve(import.meta.dirname, "..");
const workspaceRoot = resolve(appRoot, "../..");
const source = resolve(workspaceRoot, "packages/adapter-sqlite-web/dist/worker");
const target = resolve(appRoot, "public/engine-worker");

mkdirSync(target, { recursive: true });
copyFileSync(resolve(source, "worker.js"), resolve(target, "worker.js"));
copyFileSync(resolve(source, "sqlite3.wasm"), resolve(target, "sqlite3.wasm"));
