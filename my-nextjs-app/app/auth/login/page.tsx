"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const targetAfterLogin =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/hotels";
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Error al enviar OTP");
      return;
    }

    setStep("otp");
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      otpCode,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Código OTP incorrecto o credenciales inválidas");
      return;
    }

    router.push(targetAfterLogin);
    router.refresh();
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-[#153243]">
      <div className="absolute inset-0 hero-grid opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(180,184,171,0.38),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(40,75,99,0.12),_transparent_28%),linear-gradient(180deg,_#eef0eb,_#f4f9e9)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <section className="panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#284B63]">Access</p>
              <h2 className="mt-2 text-3xl font-black text-[#153243]">wave<span className="text-[#284B63]">.</span></h2>
              <p className="mt-2 text-sm text-[#284B63]/80">
                {step === "credentials" ? "Inicia sesión en tu cuenta" : "Verifica tu identidad"}
              </p>
            </div>

            {step === "credentials" ? (
              <>
                <button
                  onClick={() =>
                    signIn("google", {
                      callbackUrl: targetAfterLogin,
                      prompt: "select_account",
                    })
                  }
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-[#153243] bg-[#EEF0EB] px-4 py-3 text-sm font-semibold text-[#153243] transition hover:bg-[#F4F9E9]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </button>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-[#153243]/15" />
                  <span className="text-xs text-[#284B63]/80 font-medium">o con email</span>
                  <div className="flex-1 h-px bg-[#153243]/15" />
                </div>

                <form onSubmit={handleCredentials} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#284B63] mb-1.5 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="field w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#284B63] mb-1.5 uppercase tracking-wider">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="field w-full rounded-2xl px-4 py-3 text-sm"
                    />
                  </div>

                  {error && (
                    <p className="rounded-2xl border border-[#153243]/25 bg-[#B4B8AB]/25 px-3 py-2 text-xs text-[#153243]">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl border-2 border-[#153243] bg-[#284B63] px-4 py-3 text-sm font-bold text-[#F4F9E9] transition hover:bg-[#153243] disabled:opacity-50"
                  >
                    {loading ? "Enviando código..." : "Continuar →"}
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleOtp} className="space-y-6">
                <div className="rounded-3xl border border-[#153243]/20 bg-[#EEF0EB] p-5 text-center">
                  <p className="text-sm text-[#153243] leading-6">
                    Te enviamos un código de 6 dígitos a<br />
                    <span className="font-semibold text-[#153243]">{email}</span>
                  </p>
                  <p className="text-xs text-[#284B63]/80 mt-2">
                    (En desarrollo, revisa la consola del servidor)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#284B63] mb-1.5 uppercase tracking-wider">
                    Código OTP
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="field w-full rounded-2xl px-4 py-3 text-center tracking-[0.5em] text-lg font-bold"
                  />
                </div>

                {error && (
                  <p className="rounded-2xl border border-[#153243]/25 bg-[#B4B8AB]/25 px-3 py-2 text-xs text-[#153243]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full rounded-2xl border-2 border-[#153243] bg-[#284B63] px-4 py-3 text-sm font-bold text-[#F4F9E9] transition hover:bg-[#153243] disabled:opacity-50"
                >
                  {loading ? "Verificando..." : "Iniciar sesión →"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setError("");
                    setOtpCode("");
                  }}
                  className="w-full text-sm text-[#284B63] hover:text-[#153243] transition-colors"
                >
                  ← Volver
                </button>
              </form>
            )}

            <p className="text-center text-sm text-[#284B63]/80 mt-6">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/register" className="font-semibold text-[#153243] hover:text-[#284B63] transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
