"use client";
// app/admin/layout.tsx

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  {
    label: "Dashboard",
    icon: "📊",
    href: "/admin",
    exact: true,
  },
  {
    label: "Mis Hoteles",
    icon: "🏨",
    children: [
      { label: "Todos los hoteles", href: "/admin/hotels" },
      { label: "Agregar hotel",     href: "/admin/hotels/new" },
    ],
  },
  {
    label: "Otros",
    icon: "✨",
    children: [
      { label: "Experiencias", href: "/admin/experiences" },
      { label: "Extras",       href: "/admin/extras" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const [open, setOpen]       = useState(true);
  const [expanded, setExpanded] = useState<string[]>(["Mis Hoteles", "Otros"]);

  function toggleGroup(label: string) {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#FAF6F0]">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className={`${open ? "w-60" : "w-16"} shrink-0 bg-[#0B1F2D] flex flex-col transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden`}>

        {/* Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center h-12 w-full border-b border-white/10 hover:bg-white/5 transition-colors shrink-0"
          title={open ? "Colapsar" : "Expandir"}
        >
          <span className="text-white/60 text-lg">{open ? "◀" : "▶"}</span>
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {NAV.map((item) => {
            if (item.href) {
              // Item simple
              const active = isActive(item.href, item.exact);
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    active
                      ? "bg-[#C9A87C] text-[#0B1F2D]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}>
                  <span className="text-lg shrink-0">{item.icon}</span>
                  {open && <span className="text-sm font-semibold truncate">{item.label}</span>}
                </Link>
              );
            }

            // Grupo con hijos
            const isGroupExpanded = expanded.includes(item.label);
            const hasActiveChild  = item.children?.some((c) => isActive(c.href));

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    hasActiveChild
                      ? "text-[#C9A87C]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}>
                  <span className="text-lg shrink-0">{item.icon}</span>
                  {open && (
                    <>
                      <span className="text-sm font-semibold flex-1 text-left truncate">{item.label}</span>
                      <span className="text-xs text-white/40">{isGroupExpanded ? "▾" : "▸"}</span>
                    </>
                  )}
                </button>

                {open && isGroupExpanded && item.children && (
                  <div className="ml-4 mt-1 space-y-1 pl-3 border-l border-white/10">
                    {item.children.map((child) => {
                      const active = isActive(child.href);
                      return (
                        <Link key={child.href} href={child.href}
                          className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            active
                              ? "bg-[#C9A87C]/20 text-[#C9A87C]"
                              : "text-white/55 hover:bg-white/10 hover:text-white"
                          }`}>
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-white/10 transition-colors">
            <span className="text-lg shrink-0">🚪</span>
            {open && <span className="text-sm font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Contenido ─────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}