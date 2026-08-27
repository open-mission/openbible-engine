import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorState } from "@/components/ui/feedback";

// SPECSFY: US-001 FR-001 NFR-001 NFR-003 AC-007
describe("falha de instalação", () => {
  it("exibe falha sem esconder a interface de recuperação", () => {
    render(<ErrorState message="invalid_package: pacote inválido" onRetry={() => undefined} />);
    expect(screen.getByRole("alert")).toHaveTextContent("pacote inválido");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
