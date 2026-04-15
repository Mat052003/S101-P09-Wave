"use client";
// app/auth/login/page.tsx

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "credentials" | "otp";

// ── Hoteles para el slideshow ─────────────────────────────────────
const HOTELS = [
  {
    url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&auto=format&fit=crop&q=80",
    name: "Gran Hotel Atlántico",
    location: "Cádiz, España",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=80",
    name: "Paraíso Resort",
    location: "Cancún, México",
  },
  {
    url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop&q=80",
    name: "Bora Bora Pearl",
    location: "Bora Bora, Polinesia",
  },
  {
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&auto=format&fit=crop&q=80",
    name: "The Grand Mayfair",
    location: "Londres, Reino Unido",
  },
];

// ── Validación de contraseña ──────────────────────────────────────
function validatePassword(pwd: string) {
  const rules = [
    { id: "length",  label: "Mínimo 8 caracteres",        ok: pwd.length >= 8 },
    { id: "max",     label: "Máximo 10 caracteres",       ok: pwd.length <= 10 },
    { id: "upper",   label: "Al menos una mayúscula",     ok: /[A-Z]/.test(pwd) },
    { id: "number",  label: "Al menos un número",         ok: /[0-9]/.test(pwd) },
    { id: "symbol",  label: "Al menos un símbolo (!@#$)", ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];
  return rules;
}

export default function LoginPage() {
  const router = useRouter();
  const [step,     setStep]     = useState<Step>("credentials");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [otpCode,  setOtpCode]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const [slide,    setSlide]    = useState(0);

  // ── Slideshow automático ──────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HOTELS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const pwdRules = validatePassword(password);
  const pwdValid = pwdRules.every((r) => r.ok);

  // ── Paso 1: enviar OTP ────────────────────────────────────────
  async function handleCredentials(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!pwdValid) { setError("La contraseña no cumple los requisitos"); return; }
    setLoading(true); setError("");

    const res  = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Error al enviar OTP"); return; }
    setStep("otp");
  }

  // ── Paso 2: verificar OTP ─────────────────────────────────────
  async function handleOtp(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, otpCode, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Código OTP incorrecto o credenciales inválidas"); return; }
    router.push("/dashboard");
    router.refresh();
  }

  function handleGuest() { router.push("/"); }

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo: slideshow de hoteles ────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        {/* Slides de fondo */}
        {HOTELS.map((hotel, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
            style={{
              backgroundImage:    `url(${hotel.url})`,
              backgroundSize:     "cover",
              backgroundPosition: "center",
              opacity:            i === slide ? 1 : 0,
            }}
          />
        ))}

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900/85 via-stone-900/65 to-stone-900/80" />

        {/* Logo */}
        <div className="relative z-10">
          <span className="text-3xl font-bold text-white tracking-tight">
            Wave<span className="text-amber-400">.</span>
          </span>
        </div>

        {/* Contenido central */}
        <div className="relative z-10 space-y-6">
          <div className="w-12 h-1 bg-amber-400 rounded-full" />
          <h2 className="text-4xl font-bold text-white leading-tight">
            Experiencias únicas<br />
            <span className="text-amber-400">para cada viajero.</span>
          </h2>
          <p className="text-stone-300 text-lg leading-relaxed max-w-sm">
            Más de 80 hoteles boutique seleccionados para ofrecerte estadías que no olvidarás.
          </p>

          {/* Hotel actual */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
            <p className="text-stone-300 text-sm">
              <span className="font-semibold text-white">{HOTELS[slide].name}</span>
              {" — "}
              {HOTELS[slide].location}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-2">
            {[
              { valor: "80+",  label: "Hoteles" },
              { valor: "4.9★", label: "Valoración" },
              { valor: "12k",  label: "Huéspedes" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.valor}</p>
                <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer + dots */}
        <div className="relative z-10 flex items-center gap-2">
          {HOTELS.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? "w-6 bg-amber-400" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
          <p className="ml-auto text-xs text-stone-500">© 2025 Wave · S101-P09</p>
        </div>
      </div>

      {/* ── Panel derecho: formulario ───────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-md space-y-8">

          {/* Header móvil */}
          <div className="lg:hidden text-center">
            <span className="text-2xl font-bold text-stone-900">
              Wave<span className="text-amber-500">.</span>
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
              {step === "credentials" ? "Bienvenido de vuelta" : "Verifica tu identidad"}
            </h1>
            <p className="mt-2 text-stone-500 text-sm">
              {step === "credentials"
                ? "Ingresa tus credenciales para continuar"
                : `Código enviado a ${email}`}
            </p>
          </div>

          {step === "credentials" ? (
            <div className="space-y-6">

              {/* ── Botón Google SSO ────────────────────────────── */}
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              {/* ── Botón Invitado ──────────────────────────────── */}
              <button
                onClick={handleGuest}
                className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
              >
                <span className="text-lg">👤</span>
                Entrar como invitado
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs text-stone-400 font-medium">o con email</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* ── Formulario ──────────────────────────────────── */}
              <form onSubmit={handleCredentials} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPwdFocus(true)}
                      onBlur={() => setPwdFocus(false)}
                      placeholder="••••••••••"
                      required
                      className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors text-sm"
                    >
                      {showPwd ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Indicadores de requisitos */}
                  {(pwdFocus || password.length > 0) && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {pwdRules.map((rule) => (
                        <div key={rule.id} className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs transition-all ${
                            rule.ok ? "bg-green-500 text-white" : "bg-stone-200 text-stone-400"
                          }`}>
                            {rule.ok ? "✓" : "·"}
                          </div>
                          <span className={`text-xs transition-colors ${
                            rule.ok ? "text-green-600 font-medium" : "text-stone-400"
                          }`}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !pwdValid}
                  className="w-full bg-stone-900 hover:bg-amber-500 disabled:bg-stone-300 text-white font-bold py-4 rounded-2xl transition-all text-sm tracking-wide shadow-lg hover:shadow-amber-200 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {loading ? "Enviando código..." : "Continuar →"}
                </button>
              </form>
            </div>

          ) : (
            /* ── Paso OTP ─────────────────────────────────────────── */
            <form onSubmit={handleOtp} className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">🔐</div>
                <p className="text-sm text-stone-600 font-medium">
                  Código de 6 dígitos enviado a
                </p>
                <p className="text-sm font-bold text-stone-900 mt-1">{email}</p>
                <p className="text-xs text-stone-400 mt-2">
                  En desarrollo: revisa la consola del servidor
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Código OTP
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-stone-900 placeholder:text-stone-300 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm"
                />
                {/* Barra de progreso */}
                <div className="flex gap-1 mt-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i < otpCode.length ? "bg-amber-400" : "bg-stone-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full bg-stone-900 hover:bg-amber-500 disabled:bg-stone-300 text-white font-bold py-4 rounded-2xl transition-all text-sm tracking-wide shadow-lg hover:shadow-amber-200 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? "Verificando..." : "Iniciar sesión →"}
              </button>

              <button
                type="button"
                onClick={() => { setStep("credentials"); setError(""); setOtpCode(""); }}
                className="w-full text-sm text-stone-400 hover:text-stone-700 transition-colors py-2"
              >
                ← Volver
              </button>
            </form>
          )}

          <p className="text-center text-sm text-stone-400">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-stone-700 font-bold hover:text-amber-500 transition-colors">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
