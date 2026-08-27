import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-700 bg-slate-900 px-4 py-3">
        <nav aria-label="Navegação principal" className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-slate-100">Biblioteca</Link>
          <Link href="/busca" className="text-slate-200">Busca</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl p-4">{children}</main>
    </div>
  );
}
