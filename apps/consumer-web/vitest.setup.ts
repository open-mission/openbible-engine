import "@testing-library/jest-dom/vitest";
import { webcrypto } from "node:crypto";
import { vi } from "vitest";

// O Worker/OPFS não existem em jsdom; stub de fábrica de adapter para testes.
vi.stubGlobal("crypto", {
  getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
  randomUUID: () => "test-uuid",
  subtle: webcrypto.subtle,
});
