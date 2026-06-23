"use client";
// app/components/Navbar.tsx

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();

  // Don't show navbar on auth pages
  if (pathname?.startsWith("/auth")) return null;

  const isLoggedIn = status === "authenticated";
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

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
    <nav className="sticky top-0 z-50 bg-[#F4F9E9]/95 backdrop-blur-md border-b border-[#153243]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 bg-[#153243] rounded-lg flex items-center justify-center group-hover:bg-[#284B63] transition-colors">
            <span className="text-[#F4F9E9] text-sm font-black">W</span>
          </div>
          <span className="font-display text-xl font-semibold text-[#153243] tracking-tight">
            Wave<span className="text-[#284B63]">.</span>
          </span>
        </Link>

        {/* Nav Links — desktop */}
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

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <button
            onClick={switchLocale}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#153243]/20 bg-[#EEF0EB] text-xs font-bold text-[#153243] hover:bg-[#F4F9E9] transition-colors"
            aria-label="Switch language"
          >
            <span className={locale === "en" ? "text-[#284B63]" : "text-[#153243]/50"}>EN</span>
            <span className="text-[#153243]/30">|</span>
            <span className={locale === "es" ? "text-[#284B63]" : "text-[#153243]/50"}>ES</span>
          </button>

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 border-[#153243] bg-[#284B63] text-[#F4F9E9] hover:bg-[#153243] transition-colors"
                >
                  {t("adminPanel")}
                </Link>
              )}

              {/* User dropdown */}
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
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
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
                        👤 {t("profile")}
                      </Link>
                      <Link
                        href="/hotels"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-[#153243] hover:bg-[#EEF0EB] transition-colors"
                      >
                        🔍 {t("compareHotels")}
                      </Link>

                      {/* Mobile language switch */}
                      <button
                        onClick={() => { setMenuOpen(false); switchLocale(); }}
                        className="w-full text-left px-4 py-2 text-sm text-[#153243] hover:bg-[#EEF0EB] transition-colors sm:hidden"
                      >
                        🌐 {locale === "en" ? "Español" : "English"}
                      </button>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-[#153243] hover:bg-[#EEF0EB] transition-colors sm:hidden"
                        >
                          🏨 {t("adminPanel")}
                        </Link>
                      )}

                      <div className="border-t border-[#153243]/10 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            signOut({ callbackUrl: `/${locale}/auth/login` });
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
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
              <Link
                href="/auth/login"
                className="text-sm text-[#153243] hover:text-[#284B63] font-semibold px-3 py-2 transition-colors hidden sm:block"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-bold px-4 py-2 rounded-full border-2 border-[#153243] bg-[#284B63] text-[#F4F9E9] hover:bg-[#153243] transition-colors"
              >
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
            <span className={`w-5 h-0.5 bg-[#153243] transition-all ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`w-5 h-0.5 bg-[#153243] transition-all ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`w-5 h-0.5 bg-[#153243] transition-all ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="relative z-40 bg-[#F4F9E9] border-t border-[#153243]/15 px-4 py-4 space-y-1 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#153243] hover:bg-[#EEF0EB] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#153243] hover:bg-[#EEF0EB]">
                  {t("signIn")}
                </Link>
              </>
            )}
            <button
              onClick={() => { setMobileOpen(false); switchLocale(); }}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-[#153243] hover:bg-[#EEF0EB]"
            >
              🌐 {locale === "en" ? "Español" : "English"}
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
