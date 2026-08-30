import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OfflineBanner } from "@/components/ui/feedback";

const message = "Operações locais continuam disponíveis offline após a instalação de uma Bíblia.";

afterEach(() => cleanup());

// SPECSFY: US-002 FR-003 NFR-003 AC-008 AC-006
describe("feedback offline", () => {
  it("começa como badge e expande a mensagem completa por teclado ou clique", () => {
    render(<OfflineBanner />);

    const toggle = screen.getByRole("button", { name: "Disponibilidade offline" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle.closest(".offline-banner")).toHaveClass("offline-banner-collapsed");
    expect(screen.queryByText(message)).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle.closest(".offline-banner")).toHaveClass("offline-banner-expanded");
    expect(screen.getByText(message)).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(message)).not.toBeInTheDocument();
  });
});
