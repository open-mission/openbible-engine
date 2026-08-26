# ADR 004 — SQLite local como fonte operacional

Data: 2026-08-26
Status: Aceita

## Decisão

Preservar formato observado `metadata(key,value)`, `book(id)`, `verse(book_id, chapter, verse, text)` com header `SQLite format 3\0`, validação de schema e sanity query, leitura read-only ordenada e busca `LIKE COLLATE NOCASE` com limite explícito. Fixture sintética pequena valida listagem, leitura, ordenação e detecção de schema inválido; não copiar banco real.

