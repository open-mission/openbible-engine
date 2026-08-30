import type {
  BibleVersionPreference,
  SyncCursor,
  SyncDevice,
  SyncOperation,
} from "@openbible/sync-core";
import type {
  SyncClock,
  SyncCredentials,
  SyncLocalStore,
  SyncPullResult,
  SyncPushResult,
  SyncRemote,
} from "@openbible/sync";

export class ControlledClock implements SyncClock {
  #value: number;

  constructor(value = 0) {
    this.#value = value;
  }

  now(): number {
    return this.#value;
  }

  advance(milliseconds: number): void {
    this.#value += milliseconds;
  }
}

export class FakeSyncLocalStore implements SyncLocalStore {
  readonly pending: SyncOperation[];
  readonly acknowledged: { operationId: string; cursor?: SyncCursor }[] = [];
  readonly appliedRemote: unknown[] = [];
  private cursor?: SyncCursor;
  private devices: SyncDevice[] = [];
  private biblePreferences: BibleVersionPreference[] = [];

  constructor(pending: readonly SyncOperation[] = []) {
    this.pending = [...pending];
  }

  async listPending(): Promise<readonly SyncOperation[]> {
    return this.pending;
  }

  async enqueue(operation: SyncOperation): Promise<void> {
    if (!this.pending.some((item) => item.operationId === operation.operationId)) {
      this.pending.push(operation);
    }
  }

  async acknowledge(operationId: string, cursor?: SyncCursor): Promise<void> {
    this.acknowledged.push({ operationId, cursor });
    const index = this.pending.findIndex((item) => item.operationId === operationId);
    if (index >= 0) this.pending.splice(index, 1);
  }

  async applyRemote(change: unknown): Promise<void> {
    this.appliedRemote.push(change);
  }

  async getCursor(): Promise<SyncCursor | undefined> {
    return this.cursor;
  }

  async setCursor(cursor: SyncCursor): Promise<void> {
    this.cursor = cursor;
  }

  async listDevices(): Promise<readonly SyncDevice[]> {
    return this.devices;
  }

  async listBiblePreferences(): Promise<readonly BibleVersionPreference[]> {
    return this.biblePreferences;
  }

  setDevices(devices: readonly SyncDevice[]): void {
    this.devices = [...devices];
  }

  setBiblePreferences(preferences: readonly BibleVersionPreference[]): void {
    this.biblePreferences = [...preferences];
  }
}

export interface FakeSyncRemoteOptions {
  pushResult?: SyncPushResult;
  pullResult?: SyncPullResult;
  pushError?: unknown;
  pullError?: unknown;
}

export class FakeSyncRemote implements SyncRemote {
  readonly pushed: SyncOperation[][] = [];
  readonly pulled: (SyncCursor | undefined)[] = [];
  private readonly options: FakeSyncRemoteOptions;

  constructor(options: FakeSyncRemoteOptions = {}) {
    this.options = options;
  }

  async push(
    operations: readonly SyncOperation[],
    _credentials: SyncCredentials,
  ): Promise<SyncPushResult> {
    this.pushed.push([...operations]);
    if (this.options.pushError !== undefined) throw this.options.pushError;
    return this.options.pushResult ?? { acknowledged: [], cursor: "cursor-0" };
  }

  async pull(
    cursor: SyncCursor | undefined,
    _credentials: SyncCredentials,
  ): Promise<SyncPullResult> {
    this.pulled.push(cursor);
    if (this.options.pullError !== undefined) throw this.options.pullError;
    return this.options.pullResult ?? { changes: [], cursor: "cursor-0" };
  }
}
