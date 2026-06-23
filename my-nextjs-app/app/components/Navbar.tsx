"use client";
// app/components/Navbar.tsx

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();

  if (pathname?.startsWith("/auth")) return null;

  const isLoggedIn = status === "authenticated";
  const isAdmin    = (session?.user as any)?.role === "ADMIN";

  const navLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/hotels" as const, label: t("hotels") },
  ];

  const searchParams = useSearchParams();
  const otherLocale = locale === "en" ? "es" : "en";

  function switchLocale() {
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url as any, { locale: otherLocale });
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0B1F2D] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
            <span className="text-[#FAF6F0] text-sm font-black font-display italic">W</span>
          </div>
          <span className="font-display text-xl font-bold text-[#FAF6F0] tracking-tight">
            Wave<span className="text-[#C9A87C]">.</span>
          </span>
        </Link>

        {/* Links centro */}
        <div className="hidden md:flex items-center gap-1 bg-white/10 rounded-full px-2 py-1.5">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active
                    ? "bg-white text-[#0B1F2D]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <button
            onClick={switchLocale}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
            aria-label="Switch language"
          >
            <span className={locale === "en" ? "text-[#C9A87C]" : "text-white/50"}>EN</span>
            <span className="text-white/30">|</span>
            <span className={locale === "es" ? "text-[#C9A87C]" : "text-white/50"}>ES</span>
          </button>

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[#C9A87C] hover:bg-[#E8845A] text-[#0B1F2D] transition-colors">
                  {t("adminPanel")}
                </Link>
              )}

              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full pl-1 pr-3 py-1 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#C9A87C] flex items-center justify-center text-[#0B1F2D] text-xs font-bold">
                    {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm font-medium text-white/90 hidden sm:block">
                    {session?.user?.name?.split(" ")[0]}
                  </span>
                  <span className="text-white/40 text-xs">▾</span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0B1F2D] border border-white/10 rounded-2xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-bold text-white truncate">{session?.user?.name}</p>
                        <p className="text-xs text-white/40 truncate">{session?.user?.email}</p>
                      </div>

                      <Link href={isAdmin ? "/dashboard?view=profile" : "/dashboard"} onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                        👤 {t("profile")}
                      </Link>
                      <Link href="/hotels" onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                        🔍 {t("compareHotels")}
                      </Link>

                      {/* Mobile language switch */}
                      <button
                        onClick={() => { setMenuOpen(false); switchLocale(); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors sm:hidden"
                      >
                        🌐 {locale === "en" ? "Español" : "English"}
                      </button>

                      {isAdmin && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 sm:hidden transition-colors">
                          🏨 {t("adminPanel")}
                        </Link>
                      )}

                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: `/${locale}/auth/login` }); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-white/10 transition-colors">
                          🚪 {t("signOut")}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors px-2 hidden sm:block">
                {t("signIn")}
              </Link>
              <Link href="/auth/register"
                className="text-sm font-semibold bg-[#C9A87C] hover:bg-[#E8845A] text-[#0B1F2D] px-5 py-2.5 rounded-full transition-colors hidden sm:block">
                {t("register")}
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`w-5 h-0.5 bg-white transition-all ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`w-5 h-0.5 bg-white transition-all ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`w-5 h-0.5 bg-white transition-all ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-40 bg-[#0B1F2D] border-t border-white/10 px-4 py-4 space-y-1 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/10">
                  {t("signIn")}
                </Link>
              </>
            )}
            <button
              onClick={() => { setMobileOpen(false); switchLocale(); }}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-white hover:bg-white/10"
            >
              🌐 {locale === "en" ? "Español" : "English"}
            </button>
          </div>
        </>
      )}
    </nav>
  );
}