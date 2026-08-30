import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "@/components/AppShell";

afterEach(() => cleanup());

describe("shell visual do aplicativo Web", () => {
  // SPECSFY: US-002 FR-002 NFR-003 AC-010
  it("ocupa a altura disponível do viewport", () => {
    render(<AppShell><div>conteúdo</div></AppShell>);

    expect(screen.getByTestId("app-shell")).toHaveClass("min-h-dvh");
  });

  // SPECSFY: US-002 FR-002 NFR-003 AC-010
  it("expõe um dock de navegação principal com Leitura e Busca", () => {
    render(<AppShell><div>conteúdo</div></AppShell>);

    expect(screen.getByRole("toolbar", { name: "Navegação principal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leitura" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Leitura" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Biblioteca" })).toHaveAttribute("href", "/library");
    expect(screen.getByRole("link", { name: "Busca" })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("button", { name: "Notas (em breve)" })).toBeDisabled();
  });
});
