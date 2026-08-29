import type { BibleVersion } from "@openbible/engine";

export interface LibraryVersion extends BibleVersion {
  installed: boolean;
}

export interface LibraryPanelProps {
  versions: LibraryVersion[];
  selectedVersionId?: string;
  busy?: boolean;
  onSelectVersion: (versionId: string) => void;
}

export function LibraryPanel({ versions, selectedVersionId, busy = false, onSelectVersion }: LibraryPanelProps) {
  const options = versions.map((version) => ({
    name: version.name,
    description: version.installed ? "Instalada · d remove" : "Disponível · D catálogo",
    value: version.id,
  }));
  const selectedIndex = Math.max(0, versions.findIndex((version) => version.id === selectedVersionId));

  return (
    <box flexDirection="column" flexGrow={1} gap={1} border borderStyle="single" borderColor="#334155" padding={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text content="Biblioteca" />
        <text content={busy ? "OPERAÇÃO EM ANDAMENTO" : "LOCAL"} fg="#38bdf8" />
      </box>
      <text content="Versões disponíveis neste dispositivo. D abre catálogo · d remove · Enter seleciona" fg="#94a3b8" />
      {versions.length === 0 ? (
        <text content="Nenhuma versão instalada. Pressione D para abrir o catálogo." fg="#facc15" />
      ) : (
        <select
          focused={!busy}
          options={options}
          selectedIndex={selectedIndex}
          onChange={(_, option) => {
            const versionId = option?.value;
            if (typeof versionId === "string") onSelectVersion(versionId);
          }}
          showScrollIndicator
          showDescription
          style={{ flexGrow: 1 }}
        />
      )}
    </box>
  );
}
