# Banco de dados

Mapa de persistência do sistema. Modelo inicial sugerido para
**TypeScript, Vitest, Node.js (SQLite real via `node:sqlite`)**.

## Fontes de dados

<!-- specsfy:database:start -->
| Fonte | Tecnologia/forma | Evidência |
| --- | --- | --- |
| A confirmar | Nenhuma estrutura reconhecida | A confirmar |

## Estruturas detectadas

| Estrutura | Tipo | Campos | Relações | Fonte |
| --- | --- | --- | --- | --- |
| A confirmar | A confirmar | A confirmar | A confirmar | A confirmar |
<!-- specsfy:database:end -->

## Decisões, ownership e retenção

- Formato SQLite do legado preservado: `metadata(key,value)`, `book(id INTEGER)`, `verse(book_id INTEGER, chapter, verse, text[, translation])`. Fixture SQLite real pequena e sem conteúdo bíblico protegido é gerada para os testes (`buildLegacySqliteBibleFixture`), não um cabeçalho seguido de JSON; campos adicionais (`translation`, `copyright`) não quebram leitura.
- IDs SQLite 1..66 convertidos para os canônicos do domínio (`gen`..`rev`) via `legacy-book-map.ts` (ordem = `BOOKS`/`BOOK_META` legado) ao listar livros, ler capítulos e buscar.
- Instalação (dono: `BibleInstaller`) em 9 passos com atomicidade real e **exception-safe** (reconciliação best-effort na inicialização): bytes → tmp → validar header (`SQLite format 3\0`) → validar schema (`metadata/book/verse`) → validar identidade (`metadata.versionId` OPCIONAL; se presente valida, se ausente não rejeita) → sanity query → promote atômico (rename) → registrar `installed_bibles` → cleanup/rollback. Registro faz parte da garantia transacional com compensação verificável (sem parcial, preserva anterior, sem divergência registry/armazenamento). **Não** é crash-safe completa sem journal (ver ADR-013/DEC-020).
- Leitura read-only; versículos ordenados ASC; busca `LIKE ... COLLATE NOCASE` com limite explícito e `total` = `COUNT(*)` antes do LIMIT, em ordem canônica. Ciclo de conexões corrigido: `closeVersion`/`close`, fechar antes de substituir/remover arquivo, `NodeAdapter.close()` fecha library e registry.
- Startup reconciliation best-effort: `reconcileNodeDataDir` repara `.tmp`/`.bak`/`.trash` na abertura do adapter, trata `.db` sem registry como órfão (removido) e documenta `.db + .bak` como ambíguo sem journal; estados intermediários testados. **Crash-safety completa** (journal por operação) fica como spec futura. Cancelamento via `CancellationToken` portátil em todos os checkpoints → code `cancelled`.
- **Adapter Web (`@openbible/adapter-sqlite-web`, SPEC-0002)** agora implementa os três ports sobre Worker dedicado + SQLite WASM + OPFS SAHPool (`opfs-sahpool`), sem COOP/COEP. Persistência: `store.db` (registry `installed_bibles(id,name,installed_at,version_code)`) e arquivos lógicos por versão (`/<id>.db` final, `.<id>.db.bak` backup, `.<id>.db.trash` trash, `.<id>.db.tmp-*` temporário) no mesmo pool/Worker. Sem rename público no SAHPool, promoção é cópia/importação (`importDb`/`exportFile`/`unlink`); capacidade reservada via `reserveMinimumCapacity`. Garantia nomeada: **SQLite Web legacy-compatible, exception-safe e com reconciliação best-effort** — nunca atomic rename/crash-safe/power-loss-safe (DEC-008/DEC-009).
- Reconciliation web best-effort (`reconcilePool`): remove temporários, restaura backup quando não há final, faz rollback determinístico em par final+backup, restaura trash quando o registry ainda referencia, descarta trash órfão, remove final órfão sem registry, remove registry sem final e jamais trata `store.db` como órfão.
- Instalação web exception-safe: temporary → validar header/schema/identidade/sanity → backup do final (export/import) → promover final (cópia) → registrar → cleanup; falha controlada restaura o backup e remove intermediários (cancelamento → `cancelled`; colisão de directory → `storage_busy`). Segunda aba não usa coordenação nesta fatia.
- Persistência do registro e dos finais persiste enquanto a origem mantiver OPFS; negativa de persistência permite eviction; mudar `poolDirectory` cria namespace isolado. Adapter segue **Node.js** sem TursoDB nesta entrega; sync futuro poderá adicionar migrations versionadas. Bun não afirmado para o adapter Node.
