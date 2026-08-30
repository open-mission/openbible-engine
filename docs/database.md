# Banco de dados

<!-- specsfy:documentator:start -->
## Fontes de persistência

| Arquivo |
| --- |
| apps/consumer-web/migrations/001-better-auth.sql |
| Nenhuma estrutura confirmada além das fontes listadas. |

```mermaid
erDiagram
  ENTITY { string id }
```
<!-- specsfy:documentator:end -->

## Native SDK

The Native adapter uses logical app-local storage rather than exposing physical
paths to the engine or UI.

| Logical store | Contents | Lifecycle |
| --- | --- | --- |
| `registry.json` | JSON array of installed version metadata | Atomic replacement through `registry.json.tmp` |
| `bibles/<id>.db` | Legacy SQLite bytes | Final file after validation and promotion |
| `bibles/<id>.db.tmp/.bak/.trash` | Installation and removal intermediates | Removed or restored by rollback/reconciliation |
| `downloads/<id>.sqlite.part` | Sequential remote package staging | Removed after commit, reset or failed installation |

```mermaid
erDiagram
  REGISTRY ||--o{ BIBLE_FILE : references
  REGISTRY {
    string id
    string name
    number installedAt
    number versionCode
  }
  BIBLE_FILE {
    string logicalPath
    string versionId
    string state
  }
```

The physical namespace is owned by the Native service. The adapter owns
validation, promotion, registry updates, download staging, rollback and
best-effort startup reconciliation. The consumer does not import a fixture at
runtime; the test harness uses an in-memory `NativeStorage` and synthetic SQLite
bytes.

## Remote Sync Turso/libSQL

The `@openbible/adapter-sync-turso` package owns a versioned remote schema
separate from Better Auth. It stores encrypted envelopes and technical metadata,
never note plaintext or private keys.

| Table | Purpose | Key constraints |
| --- | --- | --- |
| `sync_schema_migrations` | Applied Sync schema versions | Unique version |
| `sync_devices` | Account devices and key state | `(account_id, device_id)` |
| `sync_notes` | Current encrypted note envelope | `(account_id, note_id)` |
| `sync_revisions` | Encrypted revision history | `revision_id` |
| `sync_tombstones` | Retained remote deletions | `(account_id, note_id)`, 90-day expiry |
| `sync_operations` | Idempotent operation log and cursor | `(account_id, operation_id)`, autoincrement cursor |
| `sync_bible_preferences` | Bible metadata preferences | `(account_id, version_id)` |
| `sync_account_deletion_jobs` | Deferred account deletion | Unique account |

```mermaid
erDiagram
  SYNC_ACCOUNT ||--o{ SYNC_DEVICE : owns
  SYNC_ACCOUNT ||--o{ SYNC_NOTE : owns
  SYNC_NOTE ||--o{ SYNC_REVISION : has
  SYNC_NOTE ||--o| SYNC_TOMBSTONE : retains
  SYNC_NOTE ||--o{ SYNC_OPERATION : changes
  SYNC_ACCOUNT {
    string account_id
  }
  SYNC_DEVICE {
    string account_id
    string device_id
    string state
    number key_version
  }
  SYNC_NOTE {
    string account_id
    string note_id
    string current_revision_id
    string envelope
  }
  SYNC_REVISION {
    string revision_id
    string account_id
    string note_id
    string envelope
  }
  SYNC_TOMBSTONE {
    string account_id
    string note_id
    number expires_at
  }
  SYNC_OPERATION {
    number cursor
    string account_id
    string operation_id
    string state
  }
```
