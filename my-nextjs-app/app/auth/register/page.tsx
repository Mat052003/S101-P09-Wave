"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!PASSWORD_POLICY.test(password)) {
      setError("La contraseña debe tener minimo 8 caracteres, mayuscula, minuscula, numero y simbolo.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Error al registrarse");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 2000);
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-[#153243]">
      <div className="absolute inset-0 hero-grid opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(180,184,171,0.38),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(40,75,99,0.12),_transparent_28%),linear-gradient(180deg,_#eef0eb,_#f4f9e9)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <section className="panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#284B63] text-center">Register</p>
              <h2 className="mt-2 text-3xl font-black text-[#153243] text-center">wave<span className="text-[#284B63]">.</span></h2>
              <p className="mt-2 text-sm text-[#284B63]/80 text-center">Crea tu cuenta gratis</p>
            </div>

            {success ? (
              <div className="rounded-3xl border border-[#153243]/25 bg-[#EEF0EB] p-8 text-center">
                <p className="font-semibold text-[#153243]">Cuenta creada</p>
                <p className="text-sm text-[#284B63]/80 mt-1">Redirigiendo al login...</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#284B63] mb-1.5 uppercase tracking-wider">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    required
                    className="field w-full rounded-2xl px-4 py-3 text-sm"
                  />
                </div>
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
                    placeholder="Minimo 8, A-Z, a-z, 0-9 y simbolo"
                    minLength={8}
                    required
                    className="field w-full rounded-2xl px-4 py-3 text-sm"
                  />
                  <p className="mt-1 text-[11px] text-[#284B63]/80">
                    Debe incluir mayuscula, minuscula, numero y simbolo.
                  </p>
                </div>

                {error && (
                  <p className="rounded-2xl border border-[#153243]/25 bg-[#B4B8AB]/25 px-3 py-2 text-xs text-[#153243]">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl border-2 border-[#153243] bg-[#284B63] px-4 py-3 text-sm font-bold text-[#F4F9E9] transition hover:bg-[#153243] disabled:opacity-50"
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta →"}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-[#284B63]/80 mt-6">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="font-semibold text-[#153243] hover:text-[#284B63] transition-colors">
                Iniciar sesión
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
