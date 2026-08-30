import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BibleVersion, InstalledBible } from "@openbible/engine-core";
import { VersionPicker } from "@/features/reader/VersionPicker";

const installed: InstalledBible[] = [
  { id: "ara", name: "Almeida Revista e Atualizada", installedAt: 1, versionCode: 1 },
];
const available: BibleVersion[] = [
  { id: "nvi", name: "Nova Versão Internacional", totalBooks: 66 },
];

afterEach(() => cleanup());

// SPECSFY: US-002 FR-002 FR-004 NFR-001 NFR-003 AC-011
describe("picker de versão", () => {
  it("seleciona uma versão instalada e permite instalar uma disponível", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();
    const onInstall = vi.fn();

    render(
      <VersionPicker
        open
        versionId="ara"
        installedVersions={installed}
        availableVersions={available}
        onClose={onClose}
        onSelect={onSelect}
        onInstall={onInstall}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Selecionar versão" })).toHaveAttribute("data-picker-mode", "modal");
    fireEvent.click(screen.getByRole("tab", { name: /Disponíveis/ }));
    const installButton = screen.getByRole("button", { name: /Nova Versão Internacional/ });
    expect(installButton.parentElement).toHaveClass("hover:bg-accent/60");
    fireEvent.click(installButton);
    expect(onInstall).toHaveBeenCalledWith(available[0]);

    fireEvent.click(screen.getByRole("tab", { name: /Instaladas/ }));
    fireEvent.click(screen.getByRole("button", { name: /Almeida Revista e Atualizada/ }));
    expect(onSelect).toHaveBeenCalledWith("ara");
    expect(onClose).toHaveBeenCalled();
  });
});
