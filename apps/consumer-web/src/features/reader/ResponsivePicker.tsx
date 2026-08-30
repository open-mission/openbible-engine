"use client";

import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return isMobile;
}

export function ResponsivePicker({
  open,
  title,
  onClose,
  onEscape,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onEscape?: () => void;
  children: ReactNode;
}) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      (onEscape ?? onClose)();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onEscape, open]);

  if (!open || typeof document === "undefined") return null;

  const titleId = `picker-title-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const content = (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-picker-mode={isMobile ? "drawer" : "modal"}
      className={isMobile
        ? "flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl"
        : "flex h-full max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
        <h2 id={titleId} className="font-semibold text-foreground">{title}</h2>
        <button
          type="button"
          aria-label={`Fechar ${title.toLowerCase()}`}
          onClick={onClose}
          className="rounded-full px-2 py-1 text-xl leading-none text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          ×
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  );

  return createPortal(
    <div
      className={isMobile
        ? "fixed inset-0 z-50 flex items-end bg-black/70 p-0"
         : "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"}
      onMouseDown={onClose}
    >
      {content}
    </div>,
    document.body,
  );
}
