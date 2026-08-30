import Link from "next/link";
import type { BibleVersion, InstallationProgress, InstalledBible } from "@openbible/engine-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type VersionCardStatus = "available" | "installed" | "installing" | "removing";

export function VersionCard({
  version,
  installed,
  status,
  error,
  progress,
  onInstall,
  onCancel,
  onRemove,
}: {
  version: BibleVersion | InstalledBible;
  installed: boolean;
  status: VersionCardStatus;
  error?: string;
  progress?: InstallationProgress;
  onInstall: () => void;
  onCancel?: () => void;
  onRemove: () => void;
}) {
  const name = version.name;
  const versionId = version.id;
  const busy = status === "installing" || status === "removing";
  const receivedBytes = progress?.receivedBytes !== undefined && Number.isFinite(progress.receivedBytes) ? Math.max(0, progress.receivedBytes) : undefined;
  const totalBytes = progress?.totalBytes !== undefined && Number.isFinite(progress.totalBytes) && progress.totalBytes > 0 ? progress.totalBytes : undefined;
  const progressLabel = totalBytes !== undefined
    ? `Baixando: ${Math.min(100, Math.round(((receivedBytes ?? 0) / totalBytes) * 100))}%`
    : receivedBytes !== undefined
      ? `Baixando: ${receivedBytes} bytes recebidos`
      : "Instalando…";
  return (
    <Card className="transition-colors hover:border-primary/60">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <Badge>{versionId}</Badge>
            {installed ? <Badge className="border-emerald-700 text-emerald-300">Instalada</Badge> : <Badge>Disponível</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{("language" in version && version.language) || "Português"} · Bíblia local</p>
          {status === "installing" ? <p aria-live="polite" className="mt-2 text-sm text-primary">{progressLabel}</p> : null}
          {error ? <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {installed ? (
            <>
              <Link href={`/${encodeURIComponent(versionId)}/gn/1`} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-ring">Ler</Link>
              <Button variant="danger" disabled={busy} onClick={onRemove}>{status === "removing" ? "Removendo…" : "Remover"}</Button>
            </>
          ) : (
            <>
              <Button disabled={busy} onClick={onInstall}>{status === "installing" ? "Instalando…" : "Instalar"}</Button>
              {status === "installing" && onCancel ? <Button variant="secondary" onClick={onCancel}>Cancelar</Button> : null}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
