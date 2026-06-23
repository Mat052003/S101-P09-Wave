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
      body: JSON.stringify({ name, email, password }),
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

  const inputClass = "w-full bg-white border-2 border-[#0B1F2D]/12 rounded-2xl px-4 py-3 text-sm text-[#0B1F2D] placeholder-[#0B1F2D]/30 outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all";
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B1F2D]/50 mb-1.5";

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

      <div className="relative z-10 w-full max-w-md px-4 py-10">
        <div className="bg-[#FAF6F0]/97 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#0B1F2D]/40 p-8 border border-white/30">

          {/* Header */}
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-[#0B1F2D] rounded-xl flex items-center justify-center">
                <span className="text-[#FAF6F0] text-sm font-black font-display italic">W</span>
              </div>
              <span className="font-display text-xl font-bold text-[#0B1F2D]">
                Wave<span className="text-[#C9A87C]">.</span>
              </span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-[#0B1F2D]">{t("title")}</h1>
            <p className="text-sm text-[#0B1F2D]/55 mt-2">{t("subtitle")}</p>
          </div>

          {success ? (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-bold text-teal-700">{t("success")}</p>
              <p className="text-sm text-teal-600/80 mt-1">{t("redirecting")}</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
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
                <p className="mt-1.5 text-[10px] text-[#0B1F2D]/40 leading-relaxed">
                  {t("passwordHint")}
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-rose-600">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-[#0B1F2D] hover:bg-[#1B4965] disabled:bg-[#0B1F2D]/40 text-[#FAF6F0] font-bold py-3.5 rounded-2xl transition-colors text-sm mt-2">
                {loading ? t("creating") : `${t("create")} →`}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-[#0B1F2D]/50 mt-6">
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