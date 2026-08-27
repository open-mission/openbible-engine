# Compatibilidade — @openbible/adapter-sqlite-web

## Política de versionamento

semver/0.x: `patch` não quebra; `minor` pode quebrar com changelog + guia de
migração; `major` congela a superfície estável.

## Superfície estável

- `createWebAdapter`, `WebAdapter`, `WebAdapterOptions`, `WebCapabilities`,
  `WebReconcileStats`, `PersistentStorageState`, `PersistentStorageDecision`
- Subpath de export `./worker` apontando para `dist/worker/worker.js` (bundle do
  Worker + SQLite WASM + OPFS SAHPool).

## Garantias preservadas

- SQLite Web legacy-compatible, exception-safe e com reconciliação best-effort.
- Assets relativos ao módulo com overrides de URL (`workerUrl`/`wasmUrl`/
  `workerFactory`); sem caminho fixo em `public/`.
- Workername único — o Worker é o único proprietário do SQLite WASM/OPFS.

## Fonte normativa

Spec `0003-distribuicao-versionada-e-estabilidade-da-api-publica` (SPEC-0003).
