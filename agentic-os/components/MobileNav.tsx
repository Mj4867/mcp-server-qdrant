"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, BookOpen, Bot } from "lucide-react";
import { clsx } from "@/lib/clsx";

const ITEMS = [
  { href: "/", label: "Control", icon: LayoutDashboard },
  { href: "/agents/claude", label: "Agents", icon: Bot },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/journal", label: "Journal", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-base-800/80 px-2 py-2 backdrop-blur-xl lg:hidden">
      {ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href.replace("/claude", ""));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[10px] font-medium",
              active ? "text-neon-cyan" : "text-slate-400",
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
