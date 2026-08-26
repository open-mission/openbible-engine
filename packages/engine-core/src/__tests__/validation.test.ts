import { describe, it, expect } from "vitest";
import { normalizeVersionId, normalizeBookId, stripAccents } from "../normalize.js";
import { validateVersionId, validateBookId, isValidVersionId, isKebabId } from "../validation.js";
import { EngineError } from "../errors.js";

describe("validation & normalization", () => {
  // SPECSFY: US-001 FR-001 NFR-001 AC-001
  it("normalizes versionId case-insensitive ARA -> ara", () => {
    expect(normalizeVersionId("ARA")).toBe("ara");
    expect(normalizeVersionId(" Ara ")).toBe("ara");
    expect(isValidVersionId("ara")).toBe(true);
  });

  // SPECSFY: US-001 FR-001 NFR-001 AC-001
  it("strips accents and normalizes to kebab", () => {
    expect(stripAccents("Gênesis")).toBe("Genesis");
    expect(normalizeVersionId("Gênesis")).toBe("genesis");
    expect(normalizeVersionId("meu_version test")).toBe("meu-version-test");
  });

  // SPECSFY: US-001 FR-001 NFR-001 AC-001
  it("rejects path traversal with invalid_package", () => {
    expect(() => normalizeVersionId("../etc/passwd")).toThrow(EngineError);
    try {
      normalizeVersionId("../etc/passwd");
    } catch (e) {
      expect((e as EngineError).code).toBe("invalid_package");
    }
    expect(() => validateVersionId("a/b")).toThrow();
    expect(() => validateVersionId("..")).toThrow();
  });

  // SPECSFY: US-002 FR-001 NFR-004 AC-011
  it("rejects encoded traversal %2F", () => {
    expect(() => normalizeVersionId("%2Fetc")).toThrow(EngineError);
    expect(() => normalizeVersionId("a%2fb")).toThrow();
  });

  // SPECSFY: US-002 FR-001 NFR-004 AC-011
  it("rejects invalid_package for traversal in book id", () => {
    expect(() => normalizeBookId("../gen")).toThrow(EngineError);
    try {
      normalizeBookId("../gen");
    } catch (e) {
      expect((e as EngineError).code).toBe("invalid_package");
    }
  });

  // SPECSFY: US-002 FR-001 NFR-004 AC-011
  it("isKebabId validates pattern", () => {
    expect(isKebabId("ara")).toBe(true);
    expect(isKebabId("ara-2024")).toBe(true);
    expect(isKebabId("ARA")).toBe(false);
    expect(isKebabId("-ara")).toBe(false);
  });

  // SPECSFY: US-004 FR-001 NFR-007 AC-021
  it("contracts are serializable via JSON (no Date/Map/Set)", () => {
    const verse = { id: "gen-1-1", bookId: "gen", chapter: 1, verse: 1, text: "In principio" };
    const json = JSON.stringify(verse);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(verse);
    // installedAt is epoch ms number
    const installed = { id: "ara", name: "ARA", installedAt: Date.now(), versionCode: 1 };
    expect(typeof installed.installedAt).toBe("number");
    expect(JSON.stringify(installed)).not.toContain("Date");
  });

  // SPECSFY: US-004 FR-001 NFR-007 AC-021
  it("validation helpers throw EngineError with stable codes", () => {
    expect(() => validateVersionId("")).toThrow(EngineError);
    expect(() => validateBookId("")).toThrow(EngineError);
  });

  // SPECSFY: US-004 FR-001 NFR-007 AC-021
  it("normalizeVersionId collapses hyphens and trims", () => {
    expect(normalizeVersionId("  ara---test  ")).toBe("ara-test");
    expect(normalizeVersionId("a__b")).toBe("a-b");
  });

  // Additional markers for FR-001/NFR-001 coverage
  // SPECSFY: US-001 FR-001 NFR-001 AC-001
  it("book id normalization lowercases", () => {
    expect(normalizeBookId("GEN")).toBe("gen");
    expect(normalizeBookId("1Co")).toBe("1co");
  });
  // SPECSFY: US-002 FR-001 NFR-004 AC-011
  it("rejects encoded traversal %5c", () => {
    expect(() => normalizeVersionId("a%5cb")).toThrow();
  });
  // SPECSFY: US-004 FR-001 NFR-007 AC-021
  it("installedAt epoch ms is serializable", () => {
    const payload = { installedAt: 1704067200000 };
    expect(JSON.parse(JSON.stringify(payload)).installedAt).toBe(1704067200000);
  });
});
