import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/ui/feedback";

// SPECSFY: US-004 FR-002 FR-004 NFR-001 NFR-003 AC-008
describe("estado offline sem Bíblia", () => {
  it("orienta a instalação antes da leitura", () => {
    render(<EmptyState title="Capítulo indisponível" description="Instale esta Bíblia antes do uso offline." />);
    expect(screen.getByText("Capítulo indisponível")).toBeInTheDocument();
    expect(screen.getByText(/Instale esta Bíblia/)).toBeInTheDocument();
  });
});
