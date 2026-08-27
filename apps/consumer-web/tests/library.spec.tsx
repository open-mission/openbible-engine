import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BibleVersion } from "@openbible/engine-core";
import { VersionCard } from "@/features/library/VersionCard";

// SPECSFY: US-001 US-004 FR-001 FR-004 NFR-001 NFR-004 AC-001
describe("Biblioteca", () => {
  it("exibe uma versão disponível e dispara a instalação", () => {
    const version: BibleVersion = { id: "ara", name: "ARA", language: "pt-BR" };
    const onInstall = vi.fn();
    render(<VersionCard version={version} installed={false} status="available" onInstall={onInstall} onRemove={vi.fn()} />);
    expect(screen.getByText("ARA")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));
    expect(onInstall).toHaveBeenCalledOnce();
  });
});
