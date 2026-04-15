"use client";
// app/auth/error/page.tsx

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  OAuthAccountNotLinked: {
    title: "Cuenta ya registrada",
    body: "Tu email ya está registrado con contraseña. Ingresa con email y contraseña, o usa el mismo método que usaste al crear la cuenta.",
  },
  OAuthSignin: {
    title: "Error al iniciar con Google",
    body: "No se pudo completar el inicio de sesión con Google. Intenta de nuevo.",
  },
  OAuthCallback: {
    title: "Error de respuesta OAuth",
    body: "Hubo un problema al procesar la respuesta de Google. Intenta de nuevo.",
  },
  Verification: {
    title: "Enlace inválido",
    body: "El enlace de verificación expiró o ya fue usado.",
  },
  CredentialsSignin: {
    title: "Credenciales incorrectas",
    body: "Email o contraseña incorrectos.",
  },
  Default: {
    title: "Error de autenticación",
    body: "Ocurrió un error inesperado. Intenta iniciar sesión de nuevo.",
  },
};

function ErrorContent() {
  const params = useSearchParams();
  const code   = params.get("error") ?? "Default";
  const info   = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-md space-y-6 text-center">

        {/* Icono */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto select-none">
          {code === "OAuthAccountNotLinked" ? "🔗" : "⚠️"}
        </div>

        {/* Branding */}
        <span className="block text-2xl font-bold text-stone-900">
          Wave<span className="text-amber-500">.</span>
        </span>

        {/* Mensaje */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-stone-900">{info.title}</h1>
          <p className="text-stone-500 text-sm leading-relaxed">{info.body}</p>
        </div>

        {/* Código de error pequeño */}
        <p className="text-xs text-stone-300 font-mono">{code}</p>

        {/* Acciones */}
        <div className="space-y-3 pt-2">
          <Link
            href="/auth/login"
            className="block w-full bg-stone-900 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl transition-all text-sm tracking-wide shadow-lg hover:shadow-amber-200"
          >
            Volver al inicio de sesión
          </Link>
          <Link
            href="/auth/register"
            className="block w-full bg-white border border-stone-200 hover:border-stone-300 text-stone-700 font-semibold py-3.5 rounded-2xl transition-all text-sm shadow-sm"
          >
            Crear cuenta nueva
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
