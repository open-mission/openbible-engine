# Contexto local da TUI legada

## Origem

- Projeto consultado: `/home/claudio/Projects/open-bible`
- Área: `apps/tui`
- Data da inspeção: 2026-08-28
- Uso: evidência local para especificar o consumer TUI do `openbible-engine`.

## Evidências observadas

- `package.json` declara OpenTUI React `0.5.8`, scripts para Node e Bun, `better-sqlite3`, React e Vitest.
- `src/lib/parse-reference.ts` implementa parser local de referências.
- `src/db/bible-manager.ts`, `installed-store.ts` e `sqlite.ts` concentram leitura SQLite, registry e escolha de driver.
- `src/services/download.ts` concentra catálogo, download remoto, validação de header, staging e registro.
- `src/ui/app.tsx` concentra Biblioteca, Leitor, Busca, histórico, referência, feedback e atalhos de teclado.

## Impacto na especificação

O novo consumer preserva a jornada e os atalhos observáveis, mas delega parser, leitura, busca, instalação, remoção, erros e persistência aos exports públicos do engine e dos adapters. O armazenamento legado não é lido, copiado ou alterado.
