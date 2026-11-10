"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Flame, Search, Tags, Ticket, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Chamados", icone: Ticket },
  { href: "/artigos", label: "Artigos", icone: BookOpen },
  { href: "/busca", label: "Busca", icone: Search },
  { href: "/usuarios", label: "Usuários", icone: Users },
  { href: "/categorias", label: "Categorias", icone: Tags },
];

export function Cabecalho() {
  const pathname = usePathname();

  const ativo = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/chamados") : pathname.startsWith(href);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Flame className="size-5 text-red-600" />
          Hell-Soft
        </Link>
        <nav className="flex flex-wrap gap-1">
          {LINKS.map(({ href, label, icone: Icone }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                ativo(href) && "bg-muted font-medium text-foreground"
              )}
            >
              <Icone className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

