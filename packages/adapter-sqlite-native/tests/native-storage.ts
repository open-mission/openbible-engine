import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import type { NativeStorage } from "../src/index.js";

export class TestNativeStorage implements NativeStorage {
  readonly root = mkdtempSync(join(tmpdir(), "openbible-native-"));

  private path(relative: string): string {
    if (relative.includes("..") || relative.startsWith("/") || relative.includes("\\")) {
      throw new Error(`invalid test storage path: ${relative}`);
    }
    return join(this.root, relative);
  }

  exists(path: string): boolean {
    return existsSync(this.path(path));
  }

  readFile(path: string): Uint8Array {
    return new Uint8Array(readFileSync(this.path(path)));
  }

  writeFile(path: string, bytes: Uint8Array): void {
    const target = this.path(path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
  }

  rename(from: string, to: string): void {
    const target = this.path(to);
    mkdirSync(dirname(target), { recursive: true });
    renameSync(this.path(from), target);
  }

  remove(path: string): void {
    rmSync(this.path(path), { force: true });
  }

  list(prefix: string): readonly string[] {
    const directory = this.path(prefix);
    if (!existsSync(directory)) return [];
    return readdirSync(directory).map((name) => `${prefix}/${name}`);
  }

  close(): void {
    rmSync(this.root, { recursive: true, force: true });
  }
}
