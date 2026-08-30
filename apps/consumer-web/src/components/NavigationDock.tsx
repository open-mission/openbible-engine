"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type IconProps = { className?: string };

function Icon({ children, className }: IconProps & { children: ReactNode }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      {children}
    </svg>
  );
}

function BookIcon(props: IconProps) {
  return <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path strokeLinecap="round" d="M4 5.5v16M8 7h8M8 11h8" /></Icon>;
}

function LibraryIcon(props: IconProps) {
  return <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5h14v15H5z" /><path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h5" /></Icon>;
}

function SearchIcon(props: IconProps) {
  return <Icon {...props}><circle cx="10.8" cy="10.8" r="6.3" /><path strokeLinecap="round" d="m16 16 4.5 4.5" /></Icon>;
}

function NoteIcon(props: IconProps) {
  return <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3.5h10l4 4V20.5H5z" /><path strokeLinecap="round" d="M15 3.5v4h4M8 12h8M8 16h5" /></Icon>;
}

function HighlightIcon(props: IconProps) {
  return <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.5 4.5 5 5M13 6 5 14l-1 5 5-1 8-8M4 21h16" /></Icon>;
}

function SettingsIcon(props: IconProps) {
  return <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3.1 1.3v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3.1-1.3l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1A1.8 1.8 0 0 0 3.3 12a1.8 1.8 0 0 0-1.6-1.8 1.8 1.8 0 0 1 0-3.6h.2A1.8 1.8 0 0 0 3.2 3.5l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1A1.8 1.8 0 0 0 8.8 0a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3.1 1.3l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1A1.8 1.8 0 0 0 19.3 7c.1.9.8 1.6 1.7 1.6h.2a1.8 1.8 0 0 1 0 3.6H21a1.8 1.8 0 0 0-1.6 2.8Z" transform="translate(1 1) scale(.92)" /></Icon>;
}

function SunIcon(props: IconProps) {
  return <Icon {...props}><circle cx="12" cy="12" r="3.2" /><path strokeLinecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>;
}

function MoonIcon(props: IconProps) {
  return <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20 15.3A8.2 8.2 0 0 1 8.7 4 8.2 8.2 0 1 0 20 15.3Z" /></Icon>;
}

function DockButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={onClick === undefined}
      aria-disabled={onClick === undefined ? "true" : undefined}
      onClick={onClick}
      className={`dock-item ${active ? "dock-item-active" : ""} ${onClick === undefined ? "dock-item-disabled" : ""}`}
    >
      {children}
      <span aria-hidden="true" className="mt-0.5 text-[10px] font-medium sm:hidden">{label}</span>
    </button>
  );
}

export function NavigationDock() {
  const pathname = usePathname() ?? "/";
  const [lightTheme, setLightTheme] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem("openbible:theme");
    const isLight = stored === "light";
    root.classList.toggle("theme-light", isLight);
    root.style.colorScheme = isLight ? "light" : "dark";
    setLightTheme(isLight);
  }, []);

  function toggleTheme() {
    const nextIsLight = !lightTheme;
    document.documentElement.classList.toggle("theme-light", nextIsLight);
    document.documentElement.style.colorScheme = nextIsLight ? "light" : "dark";
    window.localStorage.setItem("openbible:theme", nextIsLight ? "light" : "dark");
    setLightTheme(nextIsLight);
  }

  const readerActive = pathname === "/" || pathname.split("/").length === 4;
  const libraryActive = pathname.startsWith("/library");
  const searchActive = pathname.startsWith("/search");

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 pb-[env(safe-area-inset-bottom)] pointer-events-none sm:bottom-5">
        <nav role="toolbar" aria-label="Navegação principal" className="dock-root pointer-events-auto">
          <Link href="/" aria-label="Leitura" aria-current={readerActive ? "page" : undefined} className={`dock-item ${readerActive ? "dock-item-active" : ""}`}>
            <BookIcon className="size-5" />
            <span aria-hidden="true" className="mt-0.5 text-[10px] font-medium sm:hidden">Leitura</span>
          </Link>
          <Link href="/library" aria-label="Biblioteca" aria-current={libraryActive ? "page" : undefined} className={`dock-item ${libraryActive ? "dock-item-active" : ""}`}>
            <LibraryIcon className="size-5" />
            <span aria-hidden="true" className="mt-0.5 text-[10px] font-medium sm:hidden">Biblioteca</span>
          </Link>
          <DockButton label="Notas (em breve)"><NoteIcon className="size-5" /></DockButton>
          <DockButton label="Destaques (em breve)"><HighlightIcon className="size-5" /></DockButton>
          <span className="dock-separator" aria-hidden="true" />
          <Link href="/search" aria-label="Busca" aria-current={searchActive ? "page" : undefined} className={`dock-item ${searchActive ? "dock-item-active" : ""}`}>
            <SearchIcon className="size-5" />
            <span aria-hidden="true" className="mt-0.5 text-[10px] font-medium sm:hidden">Busca</span>
          </Link>
          <DockButton label="Configurações" onClick={() => setSettingsOpen(true)}><SettingsIcon className="size-5" /></DockButton>
          <DockButton label={lightTheme ? "Modo escuro" : "Modo claro"} onClick={toggleTheme}>
            {lightTheme ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
          </DockButton>
        </nav>
      </div>

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onMouseDown={() => setSettingsOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="settings-title" className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="settings-title" className="font-semibold text-foreground">Configurações</h2>
                <p className="mt-1 text-sm text-muted-foreground">O armazenamento local e a engine controlam a disponibilidade das Bíblias.</p>
              </div>
              <button type="button" aria-label="Fechar configurações" onClick={() => setSettingsOpen(false)} className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">×</button>
            </div>
            <p className="mt-4 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">Notas, destaques e preferências avançadas serão conectados em fatias próprias.</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
