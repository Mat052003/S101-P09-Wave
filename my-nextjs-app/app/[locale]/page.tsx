// app/[locale]/page.tsx
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import HomeSearchForm from "../components/HomeSearchForm";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;
  const t = await getTranslations("home");

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2400&q=90"
          alt="Ocean"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#153243]/40 via-[#153243]/10 to-[#153243]/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20 grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">

        {/* Search Form */}
        <div className="lg:ml-0">
          <HomeSearchForm />
        </div>

        {/* Wave brand — desktop */}
        <div className="hidden lg:flex flex-col items-end justify-center text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80 mb-4">
            Boutique Hotels Chile
          </p>
          <h1 className="font-display text-[10rem] xl:text-[14rem] font-bold text-white leading-[0.8] tracking-tighter drop-shadow-2xl">
            Wave<span className="text-[#F4F9E9]">.</span>
          </h1>
          <p className="font-display text-2xl xl:text-3xl text-white/90 italic mt-4 max-w-md drop-shadow-lg">
            {t("headline")}
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-8 pt-8 border-t border-white/30 w-full max-w-md justify-end">
            {[
              { valor: "13+",  label: "Hotels" },
              { valor: "4.9★", label: "Rating" },
              { valor: "5",    label: "Regions" },
            ].map((s) => (
              <div key={s.label} className="text-right">
                <p className="font-display text-3xl font-bold text-white drop-shadow">{s.valor}</p>
                <p className="text-xs text-white/70 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave — mobile */}
        <div className="lg:hidden text-center">
          <h1 className="font-display text-7xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-2xl">
            Wave<span className="text-[#F4F9E9]">.</span>
          </h1>
          <p className="text-white/80 mt-2">Boutique Hotels Chile</p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60">
        <span className="text-xs uppercase tracking-[0.3em]">{t("cta")}</span>
        <div className="w-px h-8 bg-white/40 animate-pulse" />
      </div>

      {/* CTA for logged out users */}
      {!isLoggedIn && (
        <div className="relative z-10 bg-[#F4F9E9] border-t border-[#153243]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#284B63] mb-3">
              {t("tagline")}
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-[#153243] tracking-tight">
              {t("headline")}
            </h2>
            <p className="text-[#284B63]/85 mt-4 max-w-md mx-auto text-sm md:text-base">
              {t("description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-[#284B63] hover:bg-[#153243] text-[#F4F9E9] font-bold px-8 py-4 rounded-full transition-colors text-sm"
              >
                {t("cta")} →
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-[#EEF0EB] hover:bg-[#F4F9E9] border-2 border-[#153243] text-[#153243] font-bold px-8 py-4 rounded-full transition-colors text-sm"
              >
                {t("featuredTitle")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
