import { NavigationDock } from "@/components/NavigationDock";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="app-shell" className="min-h-dvh bg-background text-foreground">
      <main className="min-h-dvh pb-[calc(5.5rem+env(safe-area-inset-bottom))]">{children}</main>
      <NavigationDock />
    </div>
  );
}
