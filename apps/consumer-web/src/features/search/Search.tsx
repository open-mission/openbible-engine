"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState, ErrorState, OfflineBanner } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { useBibleEngine } from "@/engine/bible-engine-provider";
import { SearchForm } from "@/features/search/SearchForm";
import { SearchResults, type DisplaySearchResult } from "@/features/search/SearchResults";
import { searchInstalledVersions } from "@/features/search/search-installed";
import { getEngineErrorMessage } from "@/lib/engine-error";

export function Search() {
  const { engine, status, refresh } = useBibleEngine();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DisplaySearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (typeof window !== "undefined") setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, []);

  async function search(value: string) {
    if (!engine) return;
    setQuery(value);
    setSearched(true);
    setLoading(true);
    setError(undefined);
    window.history.replaceState(null, "", `/search?q=${encodeURIComponent(value)}`);
    try {
      setResults(await searchInstalledVersions(engine, value, 50));
    } catch (cause) {
      setError(getEngineErrorMessage(cause, "Não foi possível executar a busca."));
    } finally {
      setLoading(false);
    }
  }

  return <div className="page-frame">
    <Breadcrumbs current="Busca" />
    <OfflineBanner />
    <div className="mb-8"><p className="text-sm uppercase tracking-[0.2em] text-primary">Todas as versões instaladas</p><h1 className="mt-2 text-3xl font-semibold">Buscar na Bíblia</h1><p className="mt-2 text-muted-foreground">A busca é local e funciona sem rede.</p></div>
    {status === "loading" ? <Skeleton className="h-10" /> : null}
    {status === "error" ? <ErrorState message="Armazenamento local indisponível." onRetry={refresh} /> : null}
    {status === "ready" ? <SearchForm initialQuery={query} onSubmit={(value) => void search(value)} /> : null}
    <div className="mt-6">{error ? <ErrorState message={error} onRetry={query ? () => void search(query) : undefined} /> : loading ? <div aria-label="Buscando"><Skeleton className="h-28" /><Skeleton className="mt-3 h-28" /></div> : searched ? <SearchResults query={query} results={results} /> : <EmptyState title="Comece uma busca" description="Digite um termo para procurar em todas as Bíblias instaladas." />}</div>
  </div>;
}
