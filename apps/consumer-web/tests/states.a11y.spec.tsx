import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchForm } from "@/features/search/SearchForm";
import { ErrorState } from "@/components/ui/feedback";
import { VersionCard } from "@/features/library/VersionCard";

// SPECSFY: US-001 US-003 FR-001 FR-003 NFR-003 NFR-005 AC-006
describe("estados e acessibilidade", () => {
  it("associa label ao campo e expõe erro como alerta", () => {
    render(<><SearchForm onSubmit={() => undefined} /><ErrorState message="Falha tipada" /></>);
    expect(screen.getByLabelText("Buscar versículos")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Falha tipada");
  });

  // SPECSFY: US-001 US-002 US-003 FR-001 FR-002 FR-003 NFR-003 AC-008
  it("anuncia recebimento indeterminado sem inventar percentual", () => {
    render(<VersionCard version={{ id: "ara", name: "ARA" }} installed={false} status="installing" progress={{ versionId: "ara", stage: "receiving", receivedBytes: 128 }} onInstall={() => undefined} onCancel={() => undefined} onRemove={() => undefined} />);
    const progress = screen.getByText("Baixando: 128 bytes recebidos");
    expect(progress).toHaveAttribute("aria-live", "polite");
    expect(progress).not.toHaveTextContent("%");
  });
});
