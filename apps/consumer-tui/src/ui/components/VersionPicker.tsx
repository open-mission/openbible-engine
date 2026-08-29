import type { BibleVersion } from "@openbible/engine";

export interface VersionPickerProps {
  versions: BibleVersion[];
  selectedVersionId?: string;
  busy?: boolean;
  onChoose: (versionId: string) => void;
}

export function VersionPicker({ versions, selectedVersionId, busy = false, onChoose }: VersionPickerProps) {
  const options = versions.map((version) => ({
    name: version.name,
    description: `${version.id} · Enter instala`,
    value: version.id,
  }));
  const selectedIndex = Math.max(0, versions.findIndex((version) => version.id === selectedVersionId));

  return (
    <box title="Catálogo remoto" flexDirection="column" gap={1} border borderStyle="single" borderColor="#0ea5e9" padding={1}>
      <text content={busy ? "Baixando pacote..." : "Escolha uma versão remota. Esc fecha."} fg="#cbd5e1" />
      {versions.length === 0 ? (
        <text content="Catálogo indisponível. Tente novamente." fg="#f87171" />
      ) : (
        <select
          focused={!busy}
          options={options}
          selectedIndex={selectedIndex}
          onSelect={(_, option) => {
            const versionId = option?.value;
            if (typeof versionId === "string" && !busy) onChoose(versionId);
          }}
          showScrollIndicator
          showDescription
        />
      )}
    </box>
  );
}
