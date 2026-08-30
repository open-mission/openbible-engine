import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BibleEngine } from "@openbible/engine";
import { AppLibrary } from "@/features/library/AppLibrary";

const installVersion = vi.fn(async () => undefined);
const listAvailableVersions = vi.fn(async () => [{ id: "ara", name: "ARA", language: "pt-BR" }]);
const listInstalledVersions = vi.fn(async () => []);
const engine = {
  listAvailableVersions,
  listInstalledVersions,
  installVersion,
  uninstallVersion: vi.fn(),
} as unknown as BibleEngine;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

vi.mock("@/engine/bible-engine-provider", () => ({
  useBibleEngine: () => ({
    engine,
    status: "ready",
    refresh: vi.fn(),
  }),
}));

// SPECSFY: US-001 FR-001 NFR-001 AC-001
describe("Biblioteca e origem remota", () => {
  it("delegates package resolution to the engine instead of injecting the local fixture", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<AppLibrary />);
    await screen.findByText("ARA");

    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));

    await waitFor(() => expect(installVersion).toHaveBeenCalledWith(
      expect.objectContaining({ versionId: "ara", name: "ARA", token: expect.any(Object) }),
      expect.objectContaining({ onProgress: expect.any(Function) }),
    ));
    expect(fetchMock).not.toHaveBeenCalledWith("/fixtures/ara.db");
  });

  // SPECSFY: US-001 FR-001 NFR-001 NFR-003 AC-001
  it("encaminha o observer de progresso para a instalação pública da engine", async () => {
    render(<AppLibrary />);
    await screen.findByText("ARA");

    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));

    await waitFor(() => expect(installVersion).toHaveBeenCalledWith(
      expect.objectContaining({ versionId: "ara", name: "ARA", token: expect.objectContaining({ aborted: false }) }),
      expect.objectContaining({ onProgress: expect.any(Function) }),
    ));
  });

  // SPECSFY: US-001 US-003 FR-001 FR-003 NFR-001 NFR-003 AC-003
  it("mantém a operação cancelável até a engine concluir a limpeza", async () => {
    let resolveInstall!: () => void;
    installVersion.mockImplementationOnce(() => new Promise<undefined>((resolve) => { resolveInstall = () => resolve(undefined); }));
    render(<AppLibrary />);
    await screen.findByText("ARA");

    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));
    const cancel = await screen.findByRole("button", { name: "Cancelar" });
    fireEvent.click(cancel);

    await waitFor(() => {
      const calls = installVersion.mock.calls as unknown as Array<[{ token?: { aborted: boolean; reason?: unknown } }] >;
      const input = calls[0]?.[0];
      expect(input.token?.aborted).toBe(true);
      expect(input.token?.reason).toBe("user_cancelled");
    });
    resolveInstall();
  });
});
