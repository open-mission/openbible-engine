import { describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { testRender } from "@opentui/react/test-utils";
import type { ConsumerTuiEngine } from "../src/engine.js";
import { App } from "../src/ui/App.js";
import { SearchPanel } from "../src/ui/components/SearchPanel.js";

describe("consumer TUI: navegação", () => {
  it("responde aos atalhos e comunica os estados da operação", async () => {
    // SPECSFY: US-004 NFR-001 NFR-005 AC-009
    const quit = { called: false };
    const engine = {
      listAvailableVersions: async () => [],
      listInstalledVersions: async () => [],
      installVersion: async () => undefined,
      uninstallVersion: async () => undefined,
      getBooks: async () => [],
      getChapter: async () => [],
      searchVerses: async () => ({ versionId: "", query: "", results: [], total: 0 }),
      parseReference: () => null,
      close: () => undefined,
    } as unknown as ConsumerTuiEngine;
    const setup = await testRender(createElement(App, { engine, onQuit: () => { quit.called = true; } }), {
      width: 100,
      height: 30,
    });

    try {
      await act(async () => {
        await setup.renderOnce();
        await setup.flush();
      });
      expect(setup.captureCharFrame()).toContain("Scripture Library");
      await act(async () => {
        await setup.mockInput.pressKeys(["?"], 30);
      });
      await setup.waitForFrame((frame) => frame.includes("Ajuda"), { maxPasses: 20 });
      await act(async () => {
        await setup.mockInput.pressKeys(["ESCAPE", "q"], 30);
      });
      expect(quit.called).toBe(true);
    } finally {
      act(() => setup.renderer.destroy());
    }
  });

  it("abre o catálogo com D e instala a versão selecionada com Enter", async () => {
    // SPECSFY: US-001 FR-001 AC-001 AC-009
    const installed: string[] = [];
    const engine = {
      listAvailableVersions: async () => [{ id: "ara", name: "ARA", language: "pt-BR", totalBooks: 66 }],
      listInstalledVersions: async () => [],
      installVersion: async ({ versionId }: { versionId: string }) => { installed.push(versionId); },
      uninstallVersion: async () => undefined,
      getBooks: async () => [],
      getChapter: async () => [],
      searchVerses: async () => ({ versionId: "", query: "", results: [], total: 0 }),
      parseReference: () => null,
      close: () => undefined,
    } as unknown as ConsumerTuiEngine;
    const setup = await testRender(createElement(App, { engine, onQuit: () => undefined }), {
      width: 100,
      height: 30,
    });

    try {
      await act(async () => {
        await setup.renderOnce();
        await setup.flush();
      });
      await setup.waitForFrame((frame) => frame.includes("ARA"), { maxPasses: 20 });
      await act(async () => {
        await setup.mockInput.pressKeys(["D"], 30);
      });
      await setup.waitForFrame((frame) => frame.includes("Catálogo remoto"), { maxPasses: 20 });
      await act(async () => {
        setup.mockInput.pressEnter();
        await setup.flush();
      });
      await setup.waitForFrame((frame) => frame.includes("ara instalada"), { maxPasses: 20 });
      expect(installed).toEqual(["ara"]);
    } finally {
      act(() => setup.renderer.destroy());
    }
  });

  it("mostra o texto dos versículos nos resultados da busca", async () => {
    // SPECSFY: US-003 FR-003 AC-006
    const setup = await testRender(createElement(SearchPanel, {
      versionId: "ara",
      result: {
        versionId: "ara",
        query: "luz",
        total: 1,
        results: [{ id: "gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "E a luz brilhou nas trevas." }],
      },
      onSearch: () => undefined,
      onOpenResult: () => undefined,
    }), {
      width: 100,
      height: 30,
    });

    try {
      await act(async () => {
        await setup.renderOnce();
        await setup.flush();
      });
      await act(async () => {
        await setup.mockInput.pressKeys(["l"], 30);
      });
      await setup.waitForFrame((frame) => frame.includes("Encontrados: 1"), { maxPasses: 20 });
      expect(setup.captureCharFrame()).toContain("E a luz brilhou nas trevas.");
    } finally {
      act(() => setup.renderer.destroy());
    }
  });
});
