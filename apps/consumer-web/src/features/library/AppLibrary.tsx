"use client";

import { useEffect, useRef, useState } from "react";
import type { BibleVersion, CancellationToken, InstallationProgress, InstalledBible } from "@openbible/engine-core";
import type { InstallationObserver } from "@openbible/engine";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { showDownloadError, showDownloadProgress, showDownloadStart, showDownloadSuccess } from "@/components/ui/download-toast";
import { EmptyState, ErrorState, OfflineBanner } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { VersionCard, type VersionCardStatus } from "@/features/library/VersionCard";
import { useBibleEngine } from "@/engine/bible-engine-provider";
import { getEngineErrorMessage } from "@/lib/engine-error";

type Action = { id: string; status: VersionCardStatus; error?: string; progress?: InstallationProgress };

export function AppLibrary() {
  const { engine, status, message, refresh } = useBibleEngine();
  const [available, setAvailable] = useState<BibleVersion[]>([]);
  const [installed, setInstalled] = useState<InstalledBible[]>([]);
  const [actions, setActions] = useState<Record<string, Action>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const cancelControls = useRef<Record<string, () => void>>({});

  async function load() {
    if (!engine) return;
    setLoading(true);
    setError(undefined);
    try {
      const [catalogResult, localResult] = await Promise.allSettled([engine.listAvailableVersions(), engine.listInstalledVersions()]);
      if (localResult.status === "rejected") throw localResult.reason;
      const local = localResult.value;
      setAvailable(catalogResult.status === "fulfilled" ? catalogResult.value : []);
      setInstalled(local);
      if (catalogResult.status === "rejected" && local.length === 0) {
        setError(getEngineErrorMessage(catalogResult.reason, "Não foi possível carregar as versões disponíveis."));
      }
    } catch (cause) {
      setError(getEngineErrorMessage(cause, "Não foi possível carregar a Biblioteca."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [engine]);

  async function install(version: BibleVersion) {
    if (!engine) return;
    const control = { aborted: false, reason: undefined as unknown };
    cancelControls.current[version.id] = () => {
      control.aborted = true;
      control.reason = "user_cancelled";
    };
    const token: CancellationToken = {
      get aborted() { return control.aborted; },
      get reason() { return control.reason; },
    };
    const toastId = showDownloadStart(version.name);
    const observer: InstallationObserver = {
      onProgress(progress) {
        showDownloadProgress(toastId, version.name, progress);
        setActions((current) => {
          const action = current[version.id];
          return action ? { ...current, [version.id]: { ...action, progress } } : current;
        });
      },
    };
    setActions((current) => ({ ...current, [version.id]: { id: version.id, status: "installing" } }));
    try {
      await engine.installVersion({ versionId: version.id, name: version.name, token }, observer);
      showDownloadSuccess(toastId, version.name);
      await load();
      setActions((current) => { const next = { ...current }; delete next[version.id]; return next; });
    } catch (cause) {
      showDownloadError(toastId, version.name);
      setActions((current) => ({ ...current, [version.id]: { id: version.id, status: "available", error: getEngineErrorMessage(cause, "Falha de instalação.") } }));
    } finally {
      delete cancelControls.current[version.id];
    }
  }

  function cancel(versionId: string) {
    cancelControls.current[versionId]?.();
  }

  async function remove(version: InstalledBible) {
    setActions((current) => ({ ...current, [version.id]: { id: version.id, status: "removing" } }));
    try {
      await engine?.uninstallVersion(version.id);
      await load();
      setActions((current) => { const next = { ...current }; delete next[version.id]; return next; });
    } catch (cause) {
      setActions((current) => ({ ...current, [version.id]: { id: version.id, status: "installed", error: getEngineErrorMessage(cause, "Falha ao remover.") } }));
    }
  }

  const isInstalled = (id: string) => installed.some((version) => version.id === id);
  const catalog = [...installed, ...available.filter((version) => !isInstalled(version.id))];
  return (
    <div className="page-frame">
      <Breadcrumbs current="Biblioteca" />
      <OfflineBanner />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm uppercase tracking-[0.2em] text-primary">Consumer Web</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Sua biblioteca bíblica</h1><p className="mt-2 max-w-xl text-muted-foreground">Instale versões uma vez e leia sem depender da rede.</p></div>
        <Button variant="ghost" onClick={() => { refresh(); }}>Reabrir armazenamento</Button>
      </div>
      {status === "loading" || loading ? <div className="space-y-3" aria-label="Carregando biblioteca"><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : null}
      {status === "error" ? <ErrorState message={message ?? "Armazenamento local indisponível."} onRetry={refresh} /> : null}
      {status === "ready" && error ? <ErrorState message={error} onRetry={() => void load()} /> : null}
      {status === "ready" && !loading && !error && catalog.length === 0 ? <EmptyState title="Nenhuma Bíblia disponível" description="Conecte uma fonte de pacotes ou configure uma fixture local para começar." /> : null}
       {status === "ready" && !loading && !error && catalog.length > 0 ? <div className="space-y-3" aria-live="polite">{catalog.map((version) => { const action = actions[version.id]; const installedVersion = installed.find((item) => item.id === version.id); const versionIsInstalled = installedVersion !== undefined; return <VersionCard key={version.id} version={installedVersion ?? version} installed={versionIsInstalled} status={action?.status ?? (versionIsInstalled ? "installed" : "available")} error={action?.error} progress={action?.progress} onInstall={() => void install(version as BibleVersion)} onCancel={() => cancel(version.id)} onRemove={() => { if (installedVersion) void remove(installedVersion); }} />; })}</div> : null}
    </div>
  );
}
