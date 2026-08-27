import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchForm } from "@/features/search/SearchForm";
import { ErrorState } from "@/components/ui/feedback";

// SPECSFY: US-001 US-003 FR-001 FR-003 NFR-003 NFR-005 AC-006
describe("estados e acessibilidade", () => {
  it("associa label ao campo e expõe erro como alerta", () => {
    render(<><SearchForm onSubmit={() => undefined} /><ErrorState message="Falha tipada" /></>);
    expect(screen.getByLabelText("Buscar versículos")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Falha tipada");
  });
});
