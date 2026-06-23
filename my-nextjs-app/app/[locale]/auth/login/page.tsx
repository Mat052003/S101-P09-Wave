"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl");
  const locale = useLocale();
  const targetAfterLogin = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : `/${locale}/hotels`;

  const [step, setStep]       = useState<Step>("credentials");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth.login");

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res  = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t("errorSend"));
      return;
    }

    setStep("otp");
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, otpCode, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError(t("errorOtp"));
      return;
    }

    router.push(targetAfterLogin);
    router.refresh();
  }

  const inputClass = "w-full bg-white border-2 border-[#0B1F2D]/12 rounded-2xl px-4 py-3 text-sm text-[#0B1F2D] placeholder-[#0B1F2D]/30 outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all";
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B1F2D]/50 mb-1.5";

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">

      {/* Fondo con imagen geométrica */}
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
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-[#0B1F2D] rounded-xl flex items-center justify-center">
                <span className="text-[#FAF6F0] text-sm font-black font-display italic">W</span>
              </div>
              <span className="font-display text-xl font-bold text-[#0B1F2D]">
                Wave<span className="text-[#C9A87C]">.</span>
              </span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-[#0B1F2D]">
              {step === "credentials" ? t("title") : t("verifyIdentity")}
            </h1>
            <p className="text-sm text-[#0B1F2D]/55 mt-2">
              {step === "credentials" ? t("subtitle") : `${t("otpSentTo")} ${email}`}
            </p>
          </div>

          {step === "credentials" ? (
            <>
              {/* Google */}
              <button
                onClick={() => signIn("google", { callbackUrl: targetAfterLogin, prompt: "select_account" })}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-[#0B1F2D]/15 bg-white hover:bg-[#FAF6F0] px-4 py-3 text-sm font-semibold text-[#0B1F2D] transition-all hover:border-[#0B1F2D]/30 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("continueWithGoogle")}
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#0B1F2D]/10" />
                <span className="text-xs text-[#0B1F2D]/40 font-medium">{t("orWithEmail")}</span>
                <div className="flex-1 h-px bg-[#0B1F2D]/10" />
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className={labelClass}>{t("email")}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("password")}</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required className={inputClass} />
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                    <p className="text-xs text-rose-600">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-[#0B1F2D] hover:bg-[#1B4965] disabled:bg-[#0B1F2D]/40 text-[#FAF6F0] font-bold py-3.5 rounded-2xl transition-colors text-sm">
                  {loading ? t("sendingCode") : `${t("continue")}`}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleOtp} className="space-y-5">
              <div className="bg-[#0B1F2D]/5 border border-[#0B1F2D]/10 rounded-2xl p-4 text-center">
                <p className="text-sm text-[#0B1F2D]/70 leading-relaxed">
                  {t("otpDevNote")}
                </p>
              </div>

              <div>
                <label className={labelClass}>{t("otpCode")}</label>
                <input type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456" maxLength={6} required
                  className={`${inputClass} text-center tracking-[0.5em] text-xl font-bold`} />
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-rose-600">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading || otpCode.length < 6}
                className="w-full bg-[#0B1F2D] hover:bg-[#1B4965] disabled:bg-[#0B1F2D]/40 text-[#FAF6F0] font-bold py-3.5 rounded-2xl transition-colors text-sm">
                {loading ? t("verifying") : `${t("signIn")}`}
              </button>

              <button type="button" onClick={() => { setStep("credentials"); setError(""); setOtpCode(""); }}
                className="w-full text-sm text-[#0B1F2D]/50 hover:text-[#0B1F2D] transition-colors">
                {t("back")}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-[#0B1F2D]/50 mt-6">
            {t("noAccount")}{" "}
            <Link href="/auth/register" className="font-bold text-[#0B1F2D] hover:text-[#C9A87C] transition-colors">
              {t("registerFree")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}