"use client";

import { useEffect, useState } from "react";
import type { BibleVersion, InstalledBible, InstallationProgress } from "@openbible/engine-core";
import { ResponsivePicker } from "@/features/reader/ResponsivePicker";

export function VersionPicker({
  open,
  versionId,
  installedVersions,
  availableVersions,
  installingId,
  progress,
  error,
  loading = false,
  onClose,
  onSelect,
  onInstall,
  onCancel,
  onRetry,
}: {
  open: boolean;
  versionId: string;
  installedVersions: InstalledBible[];
  availableVersions: BibleVersion[];
  installingId?: string;
  progress?: InstallationProgress;
  error?: string;
  loading?: boolean;
  onClose: () => void;
  onSelect: (versionId: string) => void;
  onInstall: (version: BibleVersion) => void;
  onCancel?: () => void;
  onRetry?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"installed" | "available">("installed");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTab(installedVersions.length > 0 ? "installed" : "available");
  }, [installedVersions.length, open]);

  const matches = (version: { id: string; name: string }) => {
    const value = query.trim().toLocaleLowerCase();
    return !value || version.id.toLocaleLowerCase().includes(value) || version.name.toLocaleLowerCase().includes(value);
  };
  const installed = installedVersions.filter(matches);
  const available = availableVersions.filter((version) => !installedVersions.some((item) => item.id === version.id) && matches(version));

  function close() {
    setQuery("");
    onClose();
  }

  return (
    <ResponsivePicker open={open} title="Selecionar versão" onClose={close}>
      <div className="flex min-h-0 flex-col">
        <div className="sticky top-0 z-10 space-y-3 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
          <label className="sr-only" htmlFor="version-picker-search">Buscar versão</label>
          <input
            id="version-picker-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar versão..."
             className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
           <div role="tablist" aria-label="Versões da Bíblia" className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
             <button type="button" role="tab" aria-selected={tab === "installed"} onClick={() => setTab("installed")} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === "installed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
              Instaladas ({installedVersions.length})
            </button>
             <button type="button" role="tab" aria-selected={tab === "available"} onClick={() => setTab("available")} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === "available" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
              Disponíveis ({availableVersions.filter((version) => !installedVersions.some((item) => item.id === version.id)).length})
            </button>
          </div>
        </div>

        <div className="space-y-2 p-4 sm:p-6">
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Carregando versões...</p> : null}
           {error ? <div role="alert" className="rounded-xl border border-destructive bg-destructive/10 p-3 text-sm text-foreground"><p>{error}</p>{onRetry ? <button type="button" className="mt-2 underline" onClick={onRetry}>Tentar novamente</button> : null}</div> : null}
          {!loading && !error && tab === "installed" && installed.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma versão instalada.</p> : null}
          {!loading && !error && tab === "available" && available.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma versão disponível.</p> : null}
          {!loading && !error && tab === "installed" ? installed.map((version) => (
             <button key={version.id} type="button" aria-label={version.name} onClick={() => { onSelect(version.id); close(); }} className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all ${version.id === versionId ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:bg-accent/60"}`}>
              <span className="min-w-0"><span className="block truncate font-semibold">{version.name}</span><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{version.id}</span></span>
              <span aria-hidden="true" className="ml-3 text-primary">{version.id === versionId ? "✓" : "→"}</span>
            </button>
          )) : null}
          {!loading && !error && tab === "available" ? available.map((version) => (
              <div key={version.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-accent/60">
              <span className="min-w-0"><span className="block truncate font-semibold text-foreground">{version.name}</span><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{version.id}{version.totalBooks ? ` · ${version.totalBooks} livros` : ""}</span></span>
                {installingId === version.id ? <button type="button" onClick={onCancel} className="shrink-0 rounded-md bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent">Cancelar</button> : <button type="button" aria-label={`Instalar ${version.name}`} onClick={() => onInstall(version)} disabled={installingId !== undefined} className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">Instalar</button>}
            </div>
          )) : null}
          {installingId ? <InstallationStatus progress={progress} /> : null}
        </div>
      </div>
    </ResponsivePicker>
  );
}

function InstallationStatus({ progress }: { progress?: InstallationProgress }) {
  const received = progress?.receivedBytes;
  const total = progress?.totalBytes;
  const percent = received !== undefined && total !== undefined && total > 0 ? Math.min(100, Math.round((received / total) * 100)) : undefined;
  return (
    <div aria-live="polite" className="border-t border-border pt-3 text-xs text-muted-foreground">
      <p>{percent === undefined ? "Instalando versão..." : `Instalando versão... ${percent}%`}</p>
      {percent !== undefined ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div> : null}
    </div>
  );
}
