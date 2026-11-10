import type { Metadata } from "next";
import { Cabecalho } from "@/components/cabecalho";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hell-Soft",
  description: "Helpdesk Hell-Soft",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-muted/30 font-sans">
        <Cabecalho />
        <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
