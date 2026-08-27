"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { BibleBook, Verse } from "@openbible/engine-core";
import { useBibleEngine } from "@/engine/bible-engine-provider";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, OfflineBanner } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { PrevNextNav } from "@/features/reader/PrevNextNav";

function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function Reader() {
  const params = useParams<{ versao: string; livro: string; capitulo: string }>();
  const versionId = param(params.versao);
  const bookId = param(params.livro);
  const chapter = Number.parseInt(param(params.capitulo), 10);
  const { engine, status } = useBibleEngine();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [versionName, setVersionName] = useState(versionId.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!engine || !versionId || !bookId || !Number.isInteger(chapter)) return;
    let active = true;
    setLoading(true);
    setError(undefined);
    void Promise.all([
      engine.getBooks(versionId),
      engine.getChapter({ versionId, bookId, chapter }),
      engine.listInstalledVersions(),
    ]).then(([nextBooks, nextVerses, installed]) => {
      if (!active) return;
      setBooks(nextBooks);
      setVerses(nextVerses);
      setVersionName(installed.find((item) => item.id === versionId)?.name ?? versionId.toUpperCase());
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Não foi possível abrir este capítulo.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bookId, chapter, engine, versionId]);

  const bookIndex = books.findIndex((book) => book.id === bookId);
  const book = bookIndex >= 0 ? books[bookIndex] : undefined;
  const previous = chapter > 1 ? { href: `/ler/${versionId}/${bookId}/${chapter - 1}`, label: "Capítulo anterior" } : bookIndex > 0 ? { href: `/ler/${versionId}/${books[bookIndex - 1]?.id}/1`, label: books[bookIndex - 1]?.name ?? "Livro anterior" } : undefined;
  const next = book && chapter < book.chapters ? { href: `/ler/${versionId}/${bookId}/${chapter + 1}`, label: "Próximo capítulo" } : bookIndex >= 0 && bookIndex < books.length - 1 ? { href: `/ler/${versionId}/${books[bookIndex + 1]?.id}/1`, label: books[bookIndex + 1]?.name ?? "Próximo livro" } : undefined;

  if (status === "loading" || loading) return <><Breadcrumbs current="Leitor" /><Skeleton className="h-10 w-2/3" /><Skeleton className="mt-4 h-80" /></>;
  if (status === "error" || error) return <><Breadcrumbs current="Leitor" /><ErrorState message={error ?? "Armazenamento local indisponível."} /></>;
  if (!book || verses.length === 0) return <><Breadcrumbs current="Leitor" /><EmptyState title="Capítulo indisponível" description="Instale esta Bíblia e escolha um livro ou capítulo válido na Biblioteca." /><Link href="/" className="mt-4 inline-block underline">Voltar à Biblioteca</Link></>;

  return (
    <>
      <Breadcrumbs current={`${book.name} ${chapter}`} items={[{ label: "Biblioteca", href: "/" }]} />
      <OfflineBanner />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm uppercase tracking-[0.2em] text-sky-300">{versionName}</p><h1 className="mt-2 text-3xl font-semibold">{book.name} {chapter}</h1></div>
        <Link href="/busca" className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300">Buscar versículos</Link>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-400">Livro<select aria-label="Livro" value={bookId} onChange={(event) => { window.location.href = `/ler/${versionId}/${event.target.value}/1`; }} className="mt-1 min-h-10 w-full rounded-md border border-slate-600 bg-slate-950 px-3 text-slate-100">{books.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm text-slate-400">Capítulo<select aria-label="Capítulo" value={chapter} onChange={(event) => { window.location.href = `/ler/${versionId}/${bookId}/${event.target.value}`; }} className="mt-1 min-h-10 w-full rounded-md border border-slate-600 bg-slate-950 px-3 text-slate-100">{Array.from({ length: book.chapters }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <Card>
        <CardHeader><CardTitle>{book.name} {chapter} <Badge className="ml-2">{verses.length} versículos</Badge></CardTitle></CardHeader>
        <CardContent className="space-y-5">{verses.map((verse) => <p key={verse.id} className="text-lg leading-8 text-slate-200"><sup className="mr-2 text-sm font-semibold text-sky-300">{verse.verse}</sup>{verse.text}</p>)}</CardContent>
      </Card>
      <PrevNextNav previous={previous} next={next} />
    </>
  );
}
