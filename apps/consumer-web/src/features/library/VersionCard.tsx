import Link from "next/link";
import type { BibleVersion, InstalledBible } from "@openbible/engine-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type VersionCardStatus = "available" | "installed" | "installing" | "removing";

export function VersionCard({
  version,
  installed,
  status,
  error,
  onInstall,
  onRemove,
}: {
  version: BibleVersion | InstalledBible;
  installed: boolean;
  status: VersionCardStatus;
  error?: string;
  onInstall: () => void;
  onRemove: () => void;
}) {
  const name = version.name;
  const versionId = version.id;
  const busy = status === "installing" || status === "removing";
  return (
    <Card className="transition-colors hover:border-slate-500">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-100">{name}</h3>
            <Badge>{versionId}</Badge>
            {installed ? <Badge className="border-emerald-700 text-emerald-300">Instalada</Badge> : <Badge>Disponível</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-400">{("language" in version && version.language) || "Português"} · Bíblia local</p>
          {error ? <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {installed ? (
            <>
              <Link href={`/ler/${encodeURIComponent(versionId)}/gen/1`} className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300">Ler</Link>
              <Button variant="danger" disabled={busy} onClick={onRemove}>{status === "removing" ? "Removendo…" : "Remover"}</Button>
            </>
          ) : (
            <Button disabled={busy} onClick={onInstall}>{status === "installing" ? "Instalando…" : "Instalar"}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
