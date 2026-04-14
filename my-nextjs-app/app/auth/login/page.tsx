"use client";
// src/app/auth/login/page.tsx

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── PASO 1: verificar credenciales y enviar OTP ────────────────
  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Error al enviar OTP");
      return;
    }

    // En desarrollo mostramos el OTP en consola del servidor
    // En producción llegaría al email del usuario
    setStep("otp");
  }

  // ── PASO 2: verificar OTP y hacer login ───────────────────────
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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-stone-900">
            onda<span className="text-amber-500">.</span>
          </span>
          <p className="mt-2 text-stone-500 text-sm">
            {step === "credentials" ? "Inicia sesión en tu cuenta" : "Verifica tu identidad"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">

          {step === "credentials" ? (
            <>
              {/* ── Botón SSO Google ──────────────────────────────── */}
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-3 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-xs text-stone-400 font-medium">o con email</span>
                <div className="flex-1 h-px bg-stone-100" />
              </div>

              {/* ── Form email + contraseña ───────────────────────── */}
              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
                >
                  {loading ? "Enviando código..." : "Continuar →"}
                </button>
              </form>
            </>
          ) : (
            /* ── PASO 2: ingresar OTP ──────────────────────────────── */
            <form onSubmit={handleOtp} className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  🔐
                </div>
                <p className="text-sm text-stone-500">
                  Te enviamos un código de 6 dígitos a<br />
                  <span className="font-semibold text-stone-800">{email}</span>
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  (En desarrollo, revisa la consola del servidor)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Código OTP
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-center tracking-[0.5em] text-lg font-bold"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full bg-stone-900 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? "Verificando..." : "Iniciar sesión →"}
              </button>

              <button
                type="button"
                onClick={() => { setStep("credentials"); setError(""); setOtpCode(""); }}
                className="w-full text-sm text-stone-400 hover:text-stone-700 transition-colors"
              >
                ← Volver
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-stone-400 mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-stone-700 font-semibold hover:text-amber-500 transition-colors">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
