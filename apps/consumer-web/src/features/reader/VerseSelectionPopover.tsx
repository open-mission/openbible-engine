"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { BibleBook, Verse } from "@openbible/engine-core";
import { Button } from "@/components/ui/button";
import { formatVerseReference, formatVerseText } from "@/features/reader/verse-reference";

export interface SelectionAnchor {
  top: number;
  centerX: number;
  placement: "top" | "bottom";
}

type CopyKind = "reference" | "text";

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

export async function copyToClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Continue with the legacy browser fallback.
    }
  }

  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

export function VerseSelectionPopover({
  book,
  chapter,
  selectedVerses,
  versionName,
  anchor,
  onClose,
}: {
  book: BibleBook;
  chapter: number;
  selectedVerses: Verse[];
  versionName: string;
  anchor: SelectionAnchor;
  onClose: () => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<CopyKind>();
  const [feedback, setFeedback] = useState<string>();
  const reference = formatVerseReference(book, chapter, selectedVerses, versionName);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    }

    function handlePointerDown(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      if (popoverRef.current?.contains(event.target)) return;
      if (event.target.closest("[data-verse-row]")) return;
      onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [onClose]);

  async function handleCopy(kind: CopyKind) {
    const value = kind === "reference"
      ? reference
      : formatVerseText(book, chapter, selectedVerses, versionName);
    const copiedSuccessfully = await copyToClipboard(value);

    if (!copiedSuccessfully) {
      setCopied(undefined);
      setFeedback("Não foi possível copiar.");
      toast.error("Não foi possível copiar.");
      return;
    }

    setCopied(kind);
    setFeedback(kind === "reference" ? "Referência copiada." : "Texto copiado.");
    toast.success(kind === "reference" ? "Referência copiada!" : "Texto copiado!");
  }

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Ações dos versículos selecionados"
      data-verse-selection-bar=""
      className="reader-selection-popover"
      style={{
        top: anchor.top,
        left: anchor.centerX,
        transform: anchor.placement === "top"
          ? "translate(-50%, calc(-100% - 10px))"
          : "translate(-50%, 10px)",
      }}
    >
      <div className="reader-selection-actions">
        <Button
          type="button"
          variant="ghost"
          aria-label="Copiar referência"
          title={copied === "reference" ? "Referência copiada!" : "Copiar referência"}
          onClick={() => void handleCopy("reference")}
          className={copied === "reference" ? "reader-selection-action reader-selection-action-copied" : "reader-selection-action"}
        >
          <span aria-hidden="true">{copied === "reference" ? "✓" : "↗"}</span>
          <span>Referência</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          aria-label="Copiar texto"
          title={copied === "text" ? "Texto copiado!" : "Copiar texto"}
          onClick={() => void handleCopy("text")}
          className={copied === "text" ? "reader-selection-action reader-selection-action-copied" : "reader-selection-action"}
        >
          {copied === "text" ? <span aria-hidden="true">✓</span> : <CopyIcon />}
          <span>Texto</span>
        </Button>
        <span className="reader-selection-divider" aria-hidden="true" />
        <Button
          type="button"
          variant="ghost"
          aria-label="Limpar seleção"
          title="Limpar seleção"
          onClick={onClose}
          className="reader-selection-clear"
        >
          <span aria-hidden="true">×</span>
        </Button>
      </div>
      <p role="status" aria-live="polite" className="reader-selection-feedback">
        {feedback ?? ""}
      </p>
    </div>
  );
}
