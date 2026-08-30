"use client";

import { toast } from "sonner";
import type { InstallationProgress } from "@openbible/engine-core";

export type DownloadToastStatus = "loading" | "success" | "error";

export function DownloadToast({
  name,
  progress,
  status = "loading",
}: {
  name: string;
  progress?: InstallationProgress;
  status?: DownloadToastStatus;
}) {
  const received = progress?.receivedBytes !== undefined && Number.isFinite(progress.receivedBytes)
    ? Math.max(0, progress.receivedBytes)
    : undefined;
  const total = progress?.totalBytes !== undefined && Number.isFinite(progress.totalBytes) && progress.totalBytes > 0
    ? progress.totalBytes
    : undefined;
  const percent = total !== undefined ? Math.min(100, Math.round(((received ?? 0) / total) * 100)) : undefined;

  if (status === "success") {
    return (
      <div data-testid="download-toast" data-status="success" className="download-toast">
        <p className="font-semibold text-foreground">{name}</p>
        <p aria-live="polite" className="text-xs text-muted-foreground">Disponível offline</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div data-testid="download-toast" data-status="error" className="download-toast">
        <p className="font-semibold text-destructive">Falha ao baixar</p>
        <p className="truncate text-xs text-muted-foreground">{name}</p>
      </div>
    );
  }

  return (
    <div data-testid="download-toast" data-status="loading" className="download-toast">
      <p className="font-semibold text-foreground">Baixando {name}</p>
      {percent !== undefined ? (
        <>
          <div
            role="progressbar"
            aria-label={`Progresso do download de ${name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
          </div>
          <p aria-live="polite" className="mt-1 text-xs text-muted-foreground">{percent}%</p>
        </>
      ) : (
        <p aria-live="polite" className="mt-1 text-xs text-muted-foreground">
          {received !== undefined ? `${received} bytes recebidos` : "Recebendo pacote..."}
        </p>
      )}
    </div>
  );
}

function updateDownloadToast(
  id: string | number,
  name: string,
  status: DownloadToastStatus,
  progress?: InstallationProgress,
) {
  toast.custom(
    (toastId) => <DownloadToast key={toastId} name={name} status={status} progress={progress} />,
    { id, duration: status === "loading" ? Infinity : 4_000 },
  );
}

export function showDownloadStart(name: string): string | number {
  return toast.custom(
    (id) => <DownloadToast key={id} name={name} />,
    { duration: Infinity },
  );
}

export function showDownloadProgress(id: string | number, name: string, progress: InstallationProgress) {
  updateDownloadToast(id, name, "loading", progress);
}

export function showDownloadSuccess(id: string | number, name: string) {
  updateDownloadToast(id, name, "success");
}

export function showDownloadError(id: string | number, name: string) {
  updateDownloadToast(id, name, "error");
}
