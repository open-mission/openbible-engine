import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorState } from "@/components/ui/feedback";
import { getEngineErrorMessage } from "@/lib/engine-error";
import { VersionCard } from "@/features/library/VersionCard";

// SPECSFY: US-001 FR-001 NFR-001 NFR-003 AC-007
describe("falha de instalação", () => {
  it("exibe falha sem esconder a interface de recuperação", () => {
    render(<ErrorState message="invalid_package: pacote inválido" onRetry={() => undefined} />);
    expect(screen.getByRole("alert")).toHaveTextContent("pacote inválido");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  // SPECSFY: US-001 US-003 FR-001 FR-003 NFR-003 AC-003
  it("oferece cancelamento durante o download", () => {
    render(<VersionCard version={{ id: "ara", name: "ARA", language: "pt-BR" }} installed={false} status="installing" onInstall={() => undefined} onCancel={() => undefined} onRemove={() => undefined} />);
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeEnabled();
  });

  // SPECSFY: US-003 FR-003 NFR-001 AC-003 AC-007
  it("traduz códigos de erro sem expor detalhes internos", () => {
    const message = getEngineErrorMessage(
      { code: "invalid_package", message: "/tmp/ara.sqlite: SQL error" },
      "Falha de instalação.",
    );
    expect(message).toBe("O pacote da Bíblia não é válido.");
    expect(message).not.toContain("/tmp");
    expect(message).not.toContain("SQL");
  });
});
