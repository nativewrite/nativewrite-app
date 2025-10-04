"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/humanizer", label: "Humanizer" },
  { href: "/transcriber", label: "Transcriber" },
  { href: "/bookwriter", label: "Book Writer" },
  { href: "/pricing", label: "Pricing" },
  { href: "/account", label: "Account" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-64 border-r bg-white/50 dark:bg-black/20 p-4">
      <nav className="flex flex-col gap-2">
        {links.map((l) => {
          const active = pathname?.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded px-3 py-2 text-sm transition-colors ${
                active ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}



