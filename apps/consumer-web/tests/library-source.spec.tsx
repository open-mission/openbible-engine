import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

    await waitFor(() => expect(installVersion).toHaveBeenCalledWith({ versionId: "ara", name: "ARA" }));
    expect(fetchMock).not.toHaveBeenCalledWith("/fixtures/ara.db");
    vi.unstubAllGlobals();
  });
});
