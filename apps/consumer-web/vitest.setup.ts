import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// O Worker/OPFS não existem em jsdom; stub de fábrica de adapter para testes.
vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
