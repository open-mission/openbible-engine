import type { EngineErrorCode } from "@openbible/engine-core";

const MESSAGES: Record<EngineErrorCode, string> = {
  version_not_installed: "Esta versão ainda não foi instalada.",
  invalid_reference: "A referência informada não é válida.",
  invalid_package: "O pacote da Bíblia não é válido.",
  unsupported_schema: "O formato desta Bíblia não é compatível.",
  storage_unavailable: "O armazenamento local não está disponível.",
  storage_busy: "O armazenamento local está ocupado. Tente novamente.",
  storage_full: "Não há espaço local suficiente para instalar esta Bíblia.",
  database_locked: "A Bíblia está ocupada. Tente novamente.",
  network_unavailable: "A fonte da Bíblia está indisponível.",
  cancelled: "A instalação foi cancelada.",
  invalid_book: "Este livro não é válido.",
  invalid_chapter: "Este capítulo não é válido.",
};

function errorCode(value: unknown): EngineErrorCode | undefined {
  if (typeof value !== "object" || value === null || !("code" in value)) return undefined;
  const code = (value as { code: unknown }).code;
  return typeof code === "string" && code in MESSAGES ? code as EngineErrorCode : undefined;
}

export function getEngineErrorMessage(value: unknown, fallback: string): string {
  const code = errorCode(value);
  return code ? MESSAGES[code] : fallback;
}
