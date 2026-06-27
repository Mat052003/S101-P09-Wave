"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();

  const [role, setRole]       = useState<"USER" | "ADMIN">("USER");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const t = useTranslations("auth.register");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!PASSWORD_POLICY.test(password)) {
      setError(t("errorPolicy"));
      return;
    }

    setLoading(true);
    const res  = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t("errorGeneral"));
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(`/${locale}/auth/login`), 2000);
  }

  const inputClass = "w-full bg-white border-2 border-[#0B1F2D]/12 rounded-2xl px-4 py-2 text-sm text-[#0B1F2D] placeholder-[#0B1F2D]/30 outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all";
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B1F2D]/50 mb-1";

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">

      {/* Fondo */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=90"
          alt="Fondo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0B1F2D]/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-4">
        <div className="bg-[#FAF6F0]/97 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#0B1F2D]/40 p-6 border border-white/30">

          {/* Header */}
          <div className="text-center mb-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#0B1F2D] rounded-lg flex items-center justify-center">
                <span className="text-[#FAF6F0] text-xs font-black font-display italic">W</span>
              </div>
              <span className="font-display text-lg font-bold text-[#0B1F2D]">
                Wave<span className="text-[#C9A87C]">.</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-[#0B1F2D]">{t("title")}</h1>
            <p className="text-xs text-[#0B1F2D]/55 mt-1">{t("subtitle")}</p>
          </div>

          {success ? (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-bold text-teal-700">{t("success")}</p>
              <p className="text-sm text-teal-600/80 mt-1">{t("redirecting")}</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-2">
              {/* Role selector */}
              <div>
                <p className={labelClass}>¿Cómo quieres usar Wave?</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {(
                    [
                      { value: "USER",  icon: "✈️", title: "Soy viajero",              sub: "Busca y reserva hoteles" },
                      { value: "ADMIN", icon: "🏨", title: "Admin de hotel",            sub: "Gestiona tu propiedad"  },
                    ] as const
                  ).map(({ value, icon, title, sub }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={[
                        "flex flex-col items-center gap-0.5 rounded-xl border-2 px-2 py-2.5 text-center transition-all",
                        role === value
                          ? "border-[#C9A87C] bg-[#C9A87C]/10 shadow-md"
                          : "border-[#0B1F2D]/12 bg-white hover:border-[#C9A87C]/50",
                      ].join(" ")}
                    >
                      <span className="text-lg">{icon}</span>
                      <span className="text-[10px] font-bold text-[#0B1F2D] leading-tight">{title}</span>
                      <span className="text-[9px] text-[#0B1F2D]/45 leading-tight">{sub}</span>
                      {role === value && (
                        <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-[#C9A87C]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t("fullName")}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("email")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("password")}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")} minLength={8} required className={inputClass} />
                <p className="mt-1 text-[9px] text-[#0B1F2D]/40 leading-relaxed">
                  {t("passwordHint")}
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                  <p className="text-xs text-rose-600">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-[#0B1F2D] hover:bg-[#1B4965] disabled:bg-[#0B1F2D]/40 text-[#FAF6F0] font-bold py-2.5 rounded-2xl transition-colors text-sm mt-1">
                {loading ? t("creating") : `${t("create")} →`}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-[#0B1F2D]/50 mt-4">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/auth/login" className="font-bold text-[#0B1F2D] hover:text-[#C9A87C] transition-colors">
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}