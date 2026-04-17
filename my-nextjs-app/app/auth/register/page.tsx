"use client";
// app/auth/register/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function validatePassword(pwd: string) {
  return [
    { id: "length",  label: "Mínimo 8 caracteres",        ok: pwd.length >= 8 },
    { id: "max",     label: "Máximo 10 caracteres",       ok: pwd.length <= 10 && pwd.length > 0 },
    { id: "upper",   label: "Al menos una mayúscula",     ok: /[A-Z]/.test(pwd) },
    { id: "number",  label: "Al menos un número",         ok: /[0-9]/.test(pwd) },
    { id: "symbol",  label: "Al menos un símbolo (!@#$)", ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];
}

type Role = "CLIENT" | "ADMIN";
type Step = "role" | "form";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]             = useState<Step>("role");
  const [role, setRole]             = useState<Role>("CLIENT");

  // Campos comunes
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");

  // Campos solo admin
  const [phone, setPhone]           = useState("");
  const [country, setCountry]       = useState("");
  const [city, setCity]             = useState("");
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId]           = useState("");
  const [bio, setBio]               = useState("");

  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [pwdFocus, setPwdFocus]     = useState(false);

  const pwdRules = validatePassword(password);
  const pwdValid = pwdRules.every((r) => r.ok);
  const strength = pwdRules.filter((r) => r.ok).length;
  const strengthColor = ["bg-stone-200","bg-red-400","bg-orange-400","bg-yellow-400","bg-lime-400","bg-green-500"][strength];
  const strengthLabel = ["","Muy débil","Débil","Regular","Buena","Fuerte"][strength];

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdValid)            { setError("La contraseña no cumple los requisitos"); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    setLoading(true); setError("");

    const body: Record<string, string> = { name, email, password, role };
    if (role === "ADMIN") {
      body.phone        = phone;
      body.country      = country;
      body.city         = city;
      body.businessName = businessName;
      body.taxId        = taxId;
      body.bio          = bio;
    }

    const res  = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Error al registrarse"); return; }
    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 2500);
  }

  // ── PASO 1: Selección de rol ───────────────────────────────────
  if (step === "role") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-lg space-y-8">

          <div className="text-center">
            <span className="text-3xl font-bold text-stone-900">onda<span className="text-amber-500">.</span></span>
            <h1 className="mt-4 text-3xl font-bold text-stone-900 tracking-tight">¿Cómo quieres unirte?</h1>
            <p className="mt-2 text-stone-500 text-sm">Elige el tipo de cuenta que mejor te describe</p>
          </div>

          <div className="grid gap-4">
            {/* ── Opción Cliente ─────────────────────────────────── */}
            <button
              onClick={() => { setRole("CLIENT"); setStep("form"); }}
              className="group bg-white border-2 border-stone-200 hover:border-amber-400 rounded-2xl p-6 text-left transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-stone-100 group-hover:bg-amber-50 rounded-2xl flex items-center justify-center text-3xl transition-colors">
                  🧳
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-stone-900">Soy viajero</p>
                  <p className="text-sm text-stone-400 mt-0.5">Quiero explorar y reservar hoteles boutique</p>
                </div>
                <span className="text-stone-300 group-hover:text-amber-400 transition-colors text-xl">→</span>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                {["Buscar hoteles", "Hacer reservas", "Ver historial"].map((tag) => (
                  <span key={tag} className="text-xs bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </button>

            {/* ── Opción Admin ───────────────────────────────────── */}
            <button
              onClick={() => { setRole("ADMIN"); setStep("form"); }}
              className="group bg-white border-2 border-stone-200 hover:border-amber-400 rounded-2xl p-6 text-left transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-stone-100 group-hover:bg-amber-50 rounded-2xl flex items-center justify-center text-3xl transition-colors">
                  🏨
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-stone-900">Soy anfitrión</p>
                  <p className="text-sm text-stone-400 mt-0.5">Tengo un hotel boutique y quiero publicarlo</p>
                </div>
                <span className="text-stone-300 group-hover:text-amber-400 transition-colors text-xl">→</span>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                {["Publicar hotel", "Gestionar reservas", "Ver estadísticas", "Editar promociones"].map((tag) => (
                  <span key={tag} className="text-xs bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-stone-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-stone-700 font-bold hover:text-amber-500 transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── PASO 2: Formulario ─────────────────────────────────────────
  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

        <button onClick={() => setStep("role")} className="relative text-stone-400 hover:text-white text-sm transition-colors w-fit">
          ← Cambiar tipo de cuenta
        </button>

        <div className="relative space-y-6">
          <div className="w-12 h-1 bg-amber-400 rounded-full" />
          <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center text-3xl">
            {role === "CLIENT" ? "🧳" : "🏨"}
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            {role === "CLIENT" ? (
              <>Descubre hoteles<br /><span className="text-amber-400">únicos.</span></>
            ) : (
              <>Comparte tu<br /><span className="text-amber-400">espacio.</span></>
            )}
          </h2>
          <p className="text-stone-400 leading-relaxed max-w-sm">
            {role === "CLIENT"
              ? "Accede a hoteles boutique seleccionados, reserva con confianza y vive experiencias memorables."
              : "Publica tu hotel, gestiona reservas y llega a miles de viajeros que buscan experiencias únicas."}
          </p>
          {role === "ADMIN" && (
            <div className="bg-stone-800 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Como anfitrión podrás:</p>
              {["Publicar y editar tu hotel", "Ver y gestionar reservas", "Crear promociones especiales", "Acceder a estadísticas"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-amber-400 text-xs">✓</span>
                  <span className="text-stone-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="relative text-xs text-stone-600">© 2025 Onda · S101-P09</p>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">

          <div>
            <button onClick={() => setStep("role")} className="text-xs text-stone-400 hover:text-stone-700 transition-colors mb-4 flex items-center gap-1">
              ← Volver
            </button>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
              {role === "CLIENT" ? "Crear cuenta de viajero" : "Crear cuenta de anfitrión"}
            </h1>
            <p className="mt-2 text-stone-500 text-sm">
              {role === "CLIENT" ? "Solo necesitamos lo básico" : "Cuéntanos sobre tu negocio"}
            </p>
          </div>

          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto">✅</div>
              <p className="text-xl font-bold text-stone-900">¡Cuenta creada!</p>
              <p className="text-stone-400 text-sm">Redirigiendo al login...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">

              {/* ── Campos comunes ──────────────────────────────── */}
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Nombre completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez" required
                  className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com" required
                  className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm" />
              </div>

              {/* ── Campos extra solo para Admin ────────────────── */}
              {role === "ADMIN" && (
                <>
                  <div className="border-t border-stone-100 pt-4">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4">📋 Datos de tu negocio</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Nombre del hotel / negocio</label>
                        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Hotel Boutique Las Flores" required
                          className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">País</label>
                          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                            placeholder="Chile" required
                            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Ciudad</label>
                          <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                            placeholder="Santiago" required
                            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Teléfono de contacto</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                          placeholder="+56 9 1234 5678" required
                          className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">RUT / ID Fiscal</label>
                        <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)}
                          placeholder="12.345.678-9"
                          className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Descripción breve del negocio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                          placeholder="Somos un hotel boutique familiar con 10 años de experiencia..."
                          rows={3}
                          className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm resize-none" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Contraseña ──────────────────────────────────── */}
              <div className={role === "ADMIN" ? "border-t border-stone-100 pt-4" : ""}>
                {role === "ADMIN" && <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">🔐 Seguridad</p>}
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPwdFocus(true)} onBlur={() => setPwdFocus(false)}
                    placeholder="••••••••••" required
                    className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm pr-12" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-sm">
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColor : "bg-stone-200"}`} />
                      ))}
                    </div>
                    {strengthLabel && <p className="text-xs text-stone-500 font-medium">{strengthLabel}</p>}
                  </div>
                )}

                {(pwdFocus || password.length > 0) && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {pwdRules.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs transition-all ${rule.ok ? "bg-green-500 text-white" : "bg-stone-200 text-stone-400"}`}>
                          {rule.ok ? "✓" : "·"}
                        </div>
                        <span className={`text-xs ${rule.ok ? "text-green-600 font-medium" : "text-stone-400"}`}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Confirmar contraseña</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••••" required
                  className={`w-full bg-white border rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-4 transition-all shadow-sm ${
                    confirm.length > 0 ? confirm === password ? "border-green-400 focus:ring-green-100" : "border-red-300 focus:ring-red-100"
                    : "border-stone-200 focus:border-amber-400 focus:ring-amber-100"}`} />
                {confirm.length > 0 && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">Las contraseñas no coinciden</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading || !pwdValid || password !== confirm}
                className="w-full bg-stone-900 hover:bg-amber-500 disabled:bg-stone-300 text-white font-bold py-4 rounded-2xl transition-all text-sm tracking-wide shadow-lg hover:shadow-amber-200 disabled:shadow-none disabled:cursor-not-allowed">
                {loading ? "Creando cuenta..." : `Crear cuenta ${role === "CLIENT" ? "de viajero" : "de anfitrión"} →`}
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
