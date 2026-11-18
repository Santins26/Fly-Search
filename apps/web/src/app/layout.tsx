import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import ToggleTheme from "@/components/toggleTheme";


export const metadata: Metadata = {
  title: "Viagens — preços de voos",
  description: "Compare preços de passagens aéreas por destino, estado, país e data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
        <header className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
          <nav className="border-b mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-brand-600">
              ✈ Viagens
            </Link>
            <Link href="/" className="text-sm dark:text-white hover:text-slate-900">
              Buscar voos
            </Link>
            <Link href="/precos" className="text-sm dark:text-white hover:text-slate-900">
              Preços coletados
            </Link>
             <div className="ml-auto">
            <ToggleTheme />
            
          </div>
          </nav>
         
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
