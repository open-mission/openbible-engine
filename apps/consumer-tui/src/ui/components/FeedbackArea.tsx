export type FeedbackKind = "idle" | "loading" | "success" | "error" | "offline";

export interface FeedbackAreaProps {
  kind: FeedbackKind;
  message: string;
  code?: string;
  onRetry?: () => void;
}

export function FeedbackArea({ kind, message, code, onRetry }: FeedbackAreaProps) {
  const color = kind === "error" ? "#f87171" : kind === "success" ? "#4ade80" : kind === "loading" ? "#facc15" : "#94a3b8";
  return (
    <box flexDirection="row" justifyContent="space-between" border borderStyle="single" borderColor={color} paddingX={1}>
      <text content={`${kind.toUpperCase()} · ${message}${code ? ` [${code}]` : ""}`} fg={color} />
      {kind === "error" && onRetry ? <text content="r tenta novamente" fg="#fca5a5" /> : null}
    </box>
  );
}
