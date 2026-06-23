// app/[locale]/page.tsx
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import HomeSearchForm from "../components/HomeSearchForm";
import HeroSlideshow from "../components/HeroSlideshow";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;
  const t = await getTranslations("home");

  return (
    <div className="bg-[#FAF6F0]">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] lg:h-[90vh] lg:max-h-[800px] overflow-hidden flex flex-col justify-center">
        <div className="absolute inset-0">
          <HeroSlideshow />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F2D]/85 via-[#0B1F2D]/50 to-[#0B1F2D]/20 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F2D]/80 lg:from-[#0B1F2D]/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-8 mt-4 lg:mt-0">
          <div className="order-2 lg:order-1 w-full flex justify-center lg:justify-start">
            <HomeSearchForm />
          </div>

          <div className="order-1 lg:order-2 text-center lg:text-right flex flex-col items-center lg:items-end justify-center w-full">
            <p className="text-[#C9A87C] text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] lg:tracking-[0.4em] mb-2 lg:mb-4">
              Boutique Hotels · Chile
            </p>
            <h1 className="font-display font-bold text-white leading-[0.9] lg:leading-[0.85] tracking-tight">
              <span className="block text-6xl md:text-[7rem] xl:text-[9rem]">Wave</span>
              <span className="block text-6xl md:text-[7rem] xl:text-[9rem] text-[#C9A87C] italic lg:-mt-3">.</span>
            </h1>
            <p className="font-display italic text-white/90 text-base md:text-lg xl:text-xl mt-3 lg:mt-5 max-w-xs md:max-w-sm leading-relaxed hidden sm:block">
              {t("headline")}
            </p>
            <div className="hidden lg:flex gap-8 mt-6 pt-6 border-t border-white/20">
              {[
                { n: "15+",  l: "Hoteles"    },
                { n: "4.9★", l: "Valoración" },
                { n: "5",    l: "Regiones"   },
              ].map((s) => (
                <div key={s.l} className="text-right">
                  <p className="font-display text-2xl font-bold text-white">{s.n}</p>
                  <p className="text-white/50 text-xs uppercase tracking-wider mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <section className="py-20 px-6 md:px-8 bg-[#0B1F2D]">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[#C9A87C] text-xs font-semibold uppercase tracking-[0.3em] mb-4">{t("tagline")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Tu próxima estadía<br />
              <span className="italic text-[#C9A87C]">te está esperando</span>
            </h2>
            <p className="text-white/50 mt-5 max-w-md mx-auto text-sm">
              {t("description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/auth/register"
                className="bg-[#C9A87C] hover:bg-[#E8845A] text-[#0B1F2D] font-bold px-8 py-3.5 rounded-full transition-colors text-sm">
                Crear cuenta gratis →
              </Link>
              <Link href="/auth/login"
                className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-sm">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}