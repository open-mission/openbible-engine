# Evidencias locais consultadas

Material informativo usado para conferir os contratos da entrega. Nao e uma
segunda fonte normativa.

- `packages/engine/src/ports.ts`: ports publicos de leitura, instalacao,
  observer e cancelamento.
- `packages/engine/src/engine.ts`: fachada da engine e delegacao dos casos de
  uso para os adapters.
- `packages/adapter-http/src/http-source.ts`: resolucao do catalogo, download
  R2, fallback, streaming e validacao do pacote.
- `packages/adapter-sqlite-web/src/adapter.ts`: fronteira Web do Worker,
  SQLite WASM, OPFS e reconcilicao.
- `apps/consumer-web/src/features/reader/reader-route.ts`: montagem e
  resolucao da abreviacao publica do livro na URL.
- `apps/consumer-web/tests/browser/consumer.spec.ts`: verificacao das rotas
  canonicas, selecao de `/ara/gn/2`, leitura offline e recursos removidos.

Consulta local realizada em 2026-08-30. Nenhum documento externo foi copiado.
