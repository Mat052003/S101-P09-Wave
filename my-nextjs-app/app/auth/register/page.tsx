"use client";
// app/auth/register/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Hoteles para el slideshow ─────────────────────────────────────
const HOTELS = [
  {
    url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop&q=80",
    name: "Bora Bora Pearl",
    location: "Bora Bora, Polinesia",
  },
  {
    url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&auto=format&fit=crop&q=80",
    name: "Gran Hotel Atlántico",
    location: "Cádiz, España",
  },
  {
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&auto=format&fit=crop&q=80",
    name: "The Grand Mayfair",
    location: "Londres, Reino Unido",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=80",
    name: "Paraíso Resort",
    location: "Cancún, México",
  },
];

function validatePassword(pwd: string) {
  return [
    { id: "length",  label: "Mínimo 8 caracteres",        ok: pwd.length >= 8 },
    { id: "max",     label: "Máximo 10 caracteres",       ok: pwd.length <= 10 && pwd.length > 0 },
    { id: "upper",   label: "Al menos una mayúscula",     ok: /[A-Z]/.test(pwd) },
    { id: "number",  label: "Al menos un número",         ok: /[0-9]/.test(pwd) },
    { id: "symbol",  label: "Al menos un símbolo (!@#$)", ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];
}

export default function RegisterPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const [slide,    setSlide]    = useState(0);

  // ── Slideshow automático ──────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HOTELS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const pwdRules      = validatePassword(password);
  const pwdValid      = pwdRules.every((r) => r.ok);
  const strength      = pwdRules.filter((r) => r.ok).length;
  const strengthColor = ["bg-stone-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-500"][strength];
  const strengthLabel = ["", "Muy débil", "Débil", "Regular", "Buena", "Fuerte"][strength];

  async function handleRegister(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!pwdValid)             { setError("La contraseña no cumple los requisitos"); return; }
    if (password !== confirm)  { setError("Las contraseñas no coinciden");           return; }
    setLoading(true); setError("");

    const res  = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Error al registrarse"); return; }
    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 2500);
  }

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
            Únete a miles de<br />
            <span className="text-amber-400">viajeros felices.</span>
          </h2>
          <p className="text-stone-300 text-lg leading-relaxed max-w-sm">
            Crea tu cuenta gratis y empieza a descubrir hoteles boutique únicos en todo el mundo.
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

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["🏖️ Playa", "🏔️ Montaña", "🏙️ Ciudad", "🌿 Naturaleza"].map((tag) => (
              <span key={tag} className="text-xs bg-white/10 backdrop-blur-sm text-stone-200 px-3 py-1.5 rounded-full font-medium border border-white/10">
                {tag}
              </span>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50 overflow-y-auto">
        <div className="w-full max-w-md space-y-7 py-8">

          <div className="lg:hidden text-center">
            <span className="text-2xl font-bold text-stone-900">
              Wave<span className="text-amber-500">.</span>
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Crea tu cuenta</h1>
            <p className="mt-2 text-stone-500 text-sm">Es gratis y solo toma un minuto</p>
          </div>

          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto">✅</div>
              <p className="text-xl font-bold text-stone-900">¡Cuenta creada!</p>
              <p className="text-stone-400 text-sm">Redirigiendo al login...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  required
                  className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm"
                />
              </div>

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

                {/* Barra de fortaleza */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < strength ? strengthColor : "bg-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                    {strengthLabel && (
                      <p className="text-xs text-stone-500 font-medium">{strengthLabel}</p>
                    )}
                  </div>
                )}

                {/* Requisitos */}
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

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className={`w-full bg-white border rounded-2xl px-4 py-3.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:ring-4 transition-all shadow-sm ${
                    confirm.length > 0
                      ? confirm === password
                        ? "border-green-400 focus:ring-green-100"
                        : "border-red-300 focus:ring-red-100"
                      : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"
                  }`}
                />
                {confirm.length > 0 && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">Las contraseñas no coinciden</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !pwdValid || password !== confirm}
                className="w-full bg-stone-900 hover:bg-amber-500 disabled:bg-stone-300 text-white font-bold py-4 rounded-2xl transition-all text-sm tracking-wide shadow-lg hover:shadow-amber-200 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta →"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-stone-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-stone-700 font-bold hover:text-amber-500 transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
