import { describe, it, expect } from "vitest";
import {
  detectWebCapabilities,
  resolvePersistentStorageState,
  capabilitiesAllowStorage,
} from "../../src/capabilities.js";

describe("web capabilities", () => {
  it("resolvePersistentStorageState maps a browser decision to a discriminated state", () => {
    // SPECSFY: US-001 FR-002 NFR-001 NFR-002 AC-003
    expect(resolvePersistentStorageState("granted")).toBe("granted");
    expect(resolvePersistentStorageState("denied")).toBe("denied");
    expect(resolvePersistentStorageState("unavailable")).toBe("unsupported");
    expect(resolvePersistentStorageState("not_requested")).toBe("not_requested");
  });

  it("detects absence of OPFS as a capability miss that cannot host storage", () => {
    // SPECSFY: US-001 FR-002 NFR-001 NFR-002 AC-003
    const caps = detectWebCapabilities({
      worker: true,
      webAssembly: true,
      opfs: false,
      persistentStorage: "not_requested",
    });
    expect(caps.opfs).toBe(false);
    expect(caps.worker).toBe(true);
    expect(capabilitiesAllowStorage(caps)).toBe(false);
  });

  it("a denied persistent-storage grant still yields a functional adapter", () => {
    // SPECSFY: US-001 FR-002 NFR-001 NFR-002 AC-003
    const caps = detectWebCapabilities({
      worker: true,
      webAssembly: true,
      opfs: true,
      persistentStorage: "denied",
    });
    expect(caps.opfs).toBe(true);
    expect(caps.persistentStorage).toBe("denied");
    expect(capabilitiesAllowStorage(caps)).toBe(true);
  });
});
