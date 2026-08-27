import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { InstalledBible } from "@openbible/engine-core";
import { VersionCard } from "@/features/library/VersionCard";

// SPECSFY: US-001 US-002 FR-001 FR-002 NFR-004 AC-009
describe("estados da Biblioteca", () => {
  it("distingue instalação em andamento e instalada", () => {
    const version: InstalledBible = { id: "ara", name: "ARA", installedAt: 1, versionCode: 1 };
    const { rerender } = render(<VersionCard version={version} installed={false} status="installing" onInstall={() => undefined} onRemove={() => undefined} />);
    expect(screen.getByRole("button", { name: "Instalando…" })).toBeDisabled();
    rerender(<VersionCard version={version} installed status="installed" onInstall={() => undefined} onRemove={() => undefined} />);
    expect(screen.getByText("Instalada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover" })).toBeEnabled();
  });
});
