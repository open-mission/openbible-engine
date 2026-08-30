import Link from "next/link";
import type { Verse } from "@openbible/engine-core";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";

export interface DisplaySearchResult {
  versionId: string;
  versionName: string;
  bookSegment: string;
  verse: Verse;
}

export function SearchResults({ query, results }: { query: string; results: DisplaySearchResult[] }) {
  if (results.length === 0) return <EmptyState title="Nenhum resultado" description={`Não encontramos “${query}” nas Bíblias instaladas.`} />;
  return <div className="space-y-3" aria-live="polite"><p className="text-sm text-muted-foreground">{results.length} resultado(s) para “{query}”</p>{results.map(({ versionId, versionName, bookSegment, verse }) => <Card key={`${versionId}-${verse.id}`}><CardContent><div className="mb-2 flex flex-wrap items-center gap-2"><Badge className="border-primary text-primary">{versionName}</Badge><Link className="text-sm text-primary hover:underline" href={`/${versionId}/${bookSegment}/${verse.chapter}`}>{verse.bookId} {verse.chapter}:{verse.verse}</Link></div><p className="leading-7 text-foreground">{verse.text}</p></CardContent></Card>)}</div>;
}
