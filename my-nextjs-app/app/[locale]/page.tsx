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
      <section className="relative h-[90vh] max-h-[800px] overflow-hidden">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F2D]/85 via-[#0B1F2D]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F2D]/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 h-full grid lg:grid-cols-2 gap-12 items-center py-8">
          <div className="order-2 lg:order-1">
            <HomeSearchForm />
          </div>

          <div className="order-1 lg:order-2 text-right hidden lg:flex flex-col items-end justify-center">
            <p className="text-[#C9A87C] text-xs font-semibold uppercase tracking-[0.4em] mb-4">
              Boutique Hotels · Chile
            </p>
            <h1 className="font-display font-bold text-white leading-[0.85] tracking-tight">
              <span className="block text-[7rem] xl:text-[9rem]">Wave</span>
              <span className="block text-[7rem] xl:text-[9rem] text-[#C9A87C] italic -mt-3">.</span>
            </h1>
            <p className="font-display italic text-white/80 text-lg xl:text-xl mt-3 max-w-sm leading-relaxed">
              {t("headline")}
            </p>
            <div className="flex gap-8 mt-6 pt-6 border-t border-white/20">
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

          <div className="order-1 lg:hidden text-center">
            <h1 className="font-display text-5xl font-bold text-white tracking-tight">
              Wave<span className="text-[#C9A87C] italic">.</span>
            </h1>
            <p className="text-white/70 mt-2 text-sm">Boutique Hotels · Chile</p>
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