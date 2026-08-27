import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrevNextNav } from "@/features/reader/PrevNextNav";

// SPECSFY: US-002 FR-002 FR-004 NFR-001 NFR-002 NFR-005 AC-002
describe("Leitor", () => {
  it("oferece navegação de capítulo anterior e próximo", () => {
    render(<PrevNextNav previous={{ href: "/ler/ara/gen/1", label: "Capítulo anterior" }} next={{ href: "/ler/ara/gen/3", label: "Próximo capítulo" }} />);
    expect(screen.getByRole("link", { name: /Capítulo anterior/ })).toHaveAttribute("href", "/ler/ara/gen/1");
    expect(screen.getByRole("link", { name: /Próximo capítulo/ })).toHaveAttribute("href", "/ler/ara/gen/3");
  });
});
