import { useState } from "react";
import type { SearchResult } from "@openbible/engine";

export interface SearchPanelProps {
  versionId?: string;
  result?: SearchResult;
  busy?: boolean;
  onSearch: (query: string) => void;
  onOpenResult?: (bookId: string, chapter: number, verse: number) => void;
}

export function SearchPanel({ versionId, result, busy = false, onSearch, onOpenResult }: SearchPanelProps) {
  const [query, setQuery] = useState("");

  function submit(value: string): void {
    const normalized = value.trim();
    if (normalized) onSearch(normalized);
  }

  return (
    <box flexDirection="column" flexGrow={1} gap={1} border borderStyle="single" borderColor="#334155" padding={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text content="Busca" />
        <text content={versionId ? "LOCAL" : "SEM VERSÃO"} fg="#38bdf8" />
      </box>
      <text content="Busca somente no armazenamento local. Enter executa · termo vazio mostra orientação." fg="#94a3b8" />
      <input
        focused={!busy}
        value={query}
        placeholder="Digite uma palavra ou frase"
        onInput={setQuery}
        onSubmit={() => submit(query)}
      />
      {!query.trim() ? (
        <text content="Informe um termo para procurar na versão selecionada." fg="#facc15" />
      ) : result && result.results.length === 0 ? (
        <text content={`Nenhum resultado para "${result.query}".`} fg="#facc15" />
      ) : result ? (
        <box flexDirection="column" flexGrow={1} border borderStyle="single" borderColor="#1e293b" padding={1}>
          <text content={`Encontrados: ${result.total}`} fg="#4ade80" />
          <select
            focused={!busy}
            options={result.results.map((verse) => ({
              name: `${verse.bookId} ${verse.chapter}:${verse.verse}`,
              description: verse.text,
              value: verse,
            }))}
            onSelect={(_, option) => {
              const verse = option?.value;
              if (verse && typeof verse === "object" && "bookId" in verse) {
                const selected = verse as { bookId: string; chapter: number; verse: number };
                onOpenResult?.(selected.bookId, selected.chapter, selected.verse);
              }
            }}
            showDescription
            showScrollIndicator
            style={{ flexGrow: 1 }}
          />
        </box>
      ) : (
        <text content="Pressione Enter para buscar." fg="#64748b" />
      )}
      <text content={busy ? "Consultando índice local..." : ""} fg="#facc15" />
    </box>
  );
}
