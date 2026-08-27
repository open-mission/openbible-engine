"use client";

import { useEffect, useState } from "react";
import type { BibleVersion, InstalledBible } from "@openbible/engine-core";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState, ErrorState, OfflineBanner } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { VersionCard, type VersionCardStatus } from "@/features/library/VersionCard";
import { useBibleEngine } from "@/engine/bible-engine-provider";

type Action = { id: string; status: VersionCardStatus; error?: string };

export function AppLibrary() {
  const { engine, status, message, refresh } = useBibleEngine();
  const [available, setAvailable] = useState<BibleVersion[]>([]);
  const [installed, setInstalled] = useState<InstalledBible[]>([]);
  const [actions, setActions] = useState<Record<string, Action>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  async function load() {
    if (!engine) return;
    setLoading(true);
    setError(undefined);
    try {
      const [catalog, local] = await Promise.all([engine.listAvailableVersions(), engine.listInstalledVersions()]);
      setAvailable(catalog);
      setInstalled(local);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar a Biblioteca.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [engine]);

  async function install(version: BibleVersion) {
    setActions((current) => ({ ...current, [version.id]: { id: version.id, status: "installing" } }));
    try {
      await engine?.installVersion({ versionId: version.id, name: version.name });
      await load();
      setActions((current) => { const next = { ...current }; delete next[version.id]; return next; });
    } catch (cause) {
      setActions((current) => ({ ...current, [version.id]: { id: version.id, status: "available", error: cause instanceof Error ? cause.message : "Falha de instalação." } }));
    }
  }

  async function remove(version: InstalledBible) {
    setActions((current) => ({ ...current, [version.id]: { id: version.id, status: "removing" } }));
    try {
      await engine?.uninstallVersion(version.id);
      await load();
      setActions((current) => { const next = { ...current }; delete next[version.id]; return next; });
    } catch (cause) {
      setActions((current) => ({ ...current, [version.id]: { id: version.id, status: "installed", error: cause instanceof Error ? cause.message : "Falha ao remover." } }));
    }
  }

  const isInstalled = (id: string) => installed.some((version) => version.id === id);
  const catalog = [...installed, ...available.filter((version) => !isInstalled(version.id))];
  return (
    <>
      <Breadcrumbs current="Biblioteca" />
      <OfflineBanner />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm uppercase tracking-[0.2em] text-sky-300">Consumer Web</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Sua biblioteca bíblica</h1><p className="mt-2 max-w-xl text-slate-400">Instale versões uma vez e leia sem depender da rede.</p></div>
        <Button variant="ghost" onClick={() => { refresh(); }}>Reabrir armazenamento</Button>
      </div>
      {status === "loading" || loading ? <div className="space-y-3" aria-label="Carregando biblioteca"><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : null}
      {status === "error" ? <ErrorState message={message ?? "Armazenamento local indisponível."} onRetry={refresh} /> : null}
      {status === "ready" && error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {status === "ready" && !loading && !error && catalog.length === 0 ? <EmptyState title="Nenhuma Bíblia disponível" description="Conecte uma fonte de pacotes ou configure uma fixture local para começar." /> : null}
      {status === "ready" && !loading && !error && catalog.length > 0 ? <div className="space-y-3" aria-live="polite">{catalog.map((version) => { const action = actions[version.id]; const installedVersion = installed.find((item) => item.id === version.id); const versionIsInstalled = installedVersion !== undefined; return <VersionCard key={version.id} version={installedVersion ?? version} installed={versionIsInstalled} status={action?.status ?? (versionIsInstalled ? "installed" : "available")} error={action?.error} onInstall={() => void install(version as BibleVersion)} onRemove={() => { if (installedVersion) void remove(installedVersion); }} />; })}</div> : null}
    </>
  );
}
