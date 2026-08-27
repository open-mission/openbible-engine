import type { Metadata, Viewport } from "next";
import { BibleEngineProvider } from "@/engine/bible-engine-provider";
import { AppShell } from "@/components/AppShell";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "OpenBible Engine — Consumer Web de referência",
  description: "Consumer Web/PWA offline-first de referência consumindo openbible-engine.",
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { themeColor: "#0f172a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <BibleEngineProvider>
          <AppShell>{children}</AppShell>
        </BibleEngineProvider>
      </body>
    </html>
  );
}
