import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="font-medium text-slate-200">{title}</p>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-rose-100">
      <p>{message}</p>
      {onRetry ? <button className="mt-3 underline focus:outline-none focus:ring-2 focus:ring-rose-300" onClick={onRetry}>Tentar novamente</button> : null}
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div className="mb-5 rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
      Operações locais continuam disponíveis offline após a instalação de uma Bíblia.
    </div>
  );
}
