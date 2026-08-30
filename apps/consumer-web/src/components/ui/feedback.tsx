"use client";

import { useId, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-rose-100">
      <p>{message}</p>
      {onRetry ? <button type="button" className="mt-3 underline focus:outline-none focus:ring-2 focus:ring-rose-300" onClick={onRetry}>Tentar novamente</button> : null}
    </div>
  );
}

export function OfflineBanner() {
  const [expanded, setExpanded] = useState(false);
  const messageId = useId();

  return (
    <aside className={`offline-banner ${expanded ? "offline-banner-expanded" : "offline-banner-collapsed"}`}>
      <button
        type="button"
        aria-label="Disponibilidade offline"
        aria-expanded={expanded}
        aria-controls={messageId}
        className="offline-banner-toggle"
        onClick={() => setExpanded((value) => !value)}
      >
        <span aria-hidden="true" className="offline-banner-dot" />
        <span>Offline</span>
        <span aria-hidden="true" className="offline-banner-indicator">{expanded ? "-" : "+"}</span>
      </button>
      {expanded ? <p id={messageId} className="offline-banner-message">Operações locais continuam disponíveis offline após a instalação de uma Bíblia.</p> : null}
    </aside>
  );
}
