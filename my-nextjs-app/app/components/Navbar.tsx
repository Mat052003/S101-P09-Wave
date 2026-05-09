"use client";
// app/components/Navbar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  // No mostrar navbar en páginas de auth
  if (pathname?.startsWith("/auth")) return null;

  const isLoggedIn = status === "authenticated";
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/hotels", label: "Hoteles" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#F4F9E9]/95 backdrop-blur-md border-b border-[#153243]/15">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#153243] rounded-lg flex items-center justify-center group-hover:bg-[#284B63] transition-colors">
            <span className="text-[#F4F9E9] text-sm font-black">W</span>
          </div>
          <span className="font-display text-xl font-semibold text-[#153243] tracking-tight">
            Wave<span className="text-[#284B63]">.</span>
          </span>
        </Link>

        {/* Links centrales (desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-[#EEF0EB] rounded-full px-2 py-1.5 border border-[#153243]/15">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#284B63] text-[#F4F9E9]"
                    : "text-[#153243] hover:bg-[#F4F9E9]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Acciones derecha */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 border-[#153243] bg-[#284B63] text-[#F4F9E9] hover:bg-[#153243] transition-colors"
                >
                  Panel admin
                </Link>
              )}

              {/* Menú de usuario */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-[#EEF0EB] hover:bg-[#F4F9E9] border border-[#153243]/15 rounded-full px-3 py-1.5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#284B63] flex items-center justify-center text-[#F4F9E9] text-xs font-bold">
                    {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm font-medium text-[#153243] hidden sm:block">
                    {session?.user?.name?.split(" ")[0]}
                  </span>
                  <span className="text-[#284B63] text-xs">▼</span>
                </button>

                {menuOpen && (
                  <>
                    {/* Overlay */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#F4F9E9] border border-[#153243]/15 rounded-2xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#153243]/10">
                        <p className="text-sm font-bold text-[#153243] truncate">{session?.user?.name}</p>
                        <p className="text-xs text-[#284B63]/75 truncate">{session?.user?.email}</p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-[#153243] hover:bg-[#EEF0EB] transition-colors"
                      >
                        👤 Mi perfil
                      </Link>
                      <Link
                        href="/hotels"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-[#153243] hover:bg-[#EEF0EB] transition-colors"
                      >
                        🔍 Comparar hoteles
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-[#153243] hover:bg-[#EEF0EB] transition-colors sm:hidden"
                        >
                          🏨 Panel admin
                        </Link>
                      )}

                      <div className="border-t border-[#153243]/10 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            signOut({ callbackUrl: "/auth/login" });
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          🚪 Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-[#153243] hover:text-[#284B63] font-semibold px-3 py-2 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-bold px-4 py-2 rounded-full border-2 border-[#153243] bg-[#284B63] text-[#F4F9E9] hover:bg-[#153243] transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
