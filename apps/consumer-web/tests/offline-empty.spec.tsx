import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "@/components/ui/feedback";
import { AppLibrary } from "@/features/library/AppLibrary";
import { BibleEngineProvider } from "@/engine/bible-engine-provider";

const adapterMocks = vi.hoisted(() => ({
  createWebAdapter: vi.fn(async () => { throw { code: "storage_unavailable" }; }),
}));

vi.mock("@openbible/adapter-sqlite-web", () => adapterMocks);

// SPECSFY: US-004 FR-002 FR-004 NFR-001 NFR-003 AC-008
describe("estado offline sem Bíblia", () => {
  it("orienta a instalação antes da leitura", () => {
    render(<EmptyState title="Capítulo indisponível" description="Instale esta Bíblia antes do uso offline." />);
    expect(screen.getByText("Capítulo indisponível")).toBeInTheDocument();
    expect(screen.getByText(/Instale esta Bíblia/)).toBeInTheDocument();
  });

  // SPECSFY: US-003 FR-003 NFR-001 NFR-003 AC-007
  it("mostra erro seguro e retry quando o storage Web não inicializa", async () => {
    render(<BibleEngineProvider><AppLibrary /></BibleEngineProvider>);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("O armazenamento local não está disponível."));
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Instalar" })).not.toBeInTheDocument();
  });
});
