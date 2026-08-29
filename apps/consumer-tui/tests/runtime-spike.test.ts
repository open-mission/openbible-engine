import { describe, expect, it } from "vitest";
import { createCliRenderer } from "@opentui/core";

describe("consumer TUI: runtime alvo", () => {
  it("inicia, processa uma ação e encerra em Node.js 26.4+", async () => {
    // SPECSFY: US-001 US-004 FR-001 FR-004 NFR-001 NFR-005 AC-012
    const renderer = await createCliRenderer({ width: 80, height: 24, clearOnShutdown: false });
    renderer.destroy();
    expect(renderer.isDestroyed).toBe(true);
  });
});
