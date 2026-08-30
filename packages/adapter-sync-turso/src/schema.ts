import { sql, type Generated, type Kysely } from "kysely";

export interface SyncDatabase {
  sync_schema_migrations: {
    version: number;
    applied_at: number;
  };
  sync_devices: {
    account_id: string;
    device_id: string;
    label: string;
    public_key: string;
    fingerprint: string;
    authorized_at: number;
    last_sync_at: number | null;
    state: string;
    key_version: number;
  };
  sync_notes: {
    account_id: string;
    note_id: string;
    current_revision_id: string;
    envelope: string;
    source_device_id: string;
    state: string;
    created_at: number;
    updated_at: number;
  };
  sync_revisions: {
    revision_id: string;
    account_id: string;
    note_id: string;
    device_id: string;
    envelope: string;
    created_at: number;
    state: string;
    final_revision_id: string | null;
  };
  sync_tombstones: {
    account_id: string;
    note_id: string;
    deletion_revision_id: string;
    source_device_id: string;
    created_at: number;
    expires_at: number;
  };
  sync_operations: {
    cursor: Generated<number>;
    operation_id: string;
    account_id: string;
    device_id: string;
    note_id: string;
    action: string;
    revision_id: string;
    sequence: number;
    attempts: number;
    state: string;
    last_error: string | null;
    next_retry_at: number | null;
    payload: string | null;
    created_at: number;
  };
  sync_bible_preferences: {
    account_id: string;
    version_id: string;
    name: string;
    version_code: string;
    installed_at: number | null;
    source: string;
    state: string;
  };
  sync_account_deletion_jobs: {
    job_id: string;
    account_id: string;
    requested_at: number;
    delete_after: number;
    state: string;
  };
}

export const SYNC_MIGRATION_VERSION = 1;

export const SYNC_MIGRATIONS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS sync_schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sync_devices (
    account_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    label TEXT NOT NULL,
    public_key TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    authorized_at INTEGER NOT NULL,
    last_sync_at INTEGER,
    state TEXT NOT NULL CHECK (state IN ('pending', 'active', 'revoked')),
    key_version INTEGER NOT NULL,
    PRIMARY KEY (account_id, device_id)
  )`,
  `CREATE TABLE IF NOT EXISTS sync_notes (
    account_id TEXT NOT NULL,
    note_id TEXT NOT NULL,
    current_revision_id TEXT NOT NULL,
    envelope TEXT NOT NULL,
    source_device_id TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('active', 'deleted', 'conflicted')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (account_id, note_id)
  )`,
  `CREATE TABLE IF NOT EXISTS sync_revisions (
    revision_id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    note_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    envelope TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('conflict', 'resolved')),
    final_revision_id TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS sync_tombstones (
    account_id TEXT NOT NULL,
    note_id TEXT NOT NULL,
    deletion_revision_id TEXT NOT NULL,
    source_device_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    PRIMARY KEY (account_id, note_id)
  )`,
  `CREATE TABLE IF NOT EXISTS sync_operations (
    cursor INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    note_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'import')),
    revision_id TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    attempts INTEGER NOT NULL,
    state TEXT NOT NULL,
    last_error TEXT,
    next_retry_at INTEGER,
    payload TEXT,
    created_at INTEGER NOT NULL,
    UNIQUE (account_id, operation_id)
  )`,
  `CREATE TABLE IF NOT EXISTS sync_bible_preferences (
    account_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    name TEXT NOT NULL,
    version_code TEXT NOT NULL,
    installed_at INTEGER,
    source TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('available', 'pending')),
    PRIMARY KEY (account_id, version_id)
  )`,
  `CREATE TABLE IF NOT EXISTS sync_account_deletion_jobs (
    job_id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL UNIQUE,
    requested_at INTEGER NOT NULL,
    delete_after INTEGER NOT NULL,
    state TEXT NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS sync_devices_account_idx ON sync_devices (account_id, device_id)",
  "CREATE INDEX IF NOT EXISTS sync_notes_account_idx ON sync_notes (account_id, note_id)",
  "CREATE INDEX IF NOT EXISTS sync_operations_account_cursor_idx ON sync_operations (account_id, cursor)",
  "CREATE INDEX IF NOT EXISTS sync_operations_account_note_idx ON sync_operations (account_id, note_id)",
  "CREATE INDEX IF NOT EXISTS sync_tombstones_account_expiry_idx ON sync_tombstones (account_id, expires_at)",
  "CREATE INDEX IF NOT EXISTS sync_revisions_account_note_idx ON sync_revisions (account_id, note_id)",
  "CREATE INDEX IF NOT EXISTS sync_preferences_account_idx ON sync_bible_preferences (account_id, version_id)",
];

export async function applySyncMigrations(
  database: Kysely<SyncDatabase>,
  now = 0,
): Promise<void> {
  await sql.raw(SYNC_MIGRATIONS[0]).execute(database);
  const applied = await database
    .selectFrom("sync_schema_migrations")
    .select("version")
    .execute();
  if (applied.some((row) => row.version === SYNC_MIGRATION_VERSION)) return;

  await database.transaction().execute(async (transaction) => {
    for (const statement of SYNC_MIGRATIONS.slice(1)) {
      await sql.raw(statement).execute(transaction);
    }
    await transaction
      .insertInto("sync_schema_migrations")
      .values({ version: SYNC_MIGRATION_VERSION, applied_at: now })
      .execute();
  });
}
