import { Link } from "@/i18n/navigation";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const error = resolvedParams.error ?? "Ocurrió un error inesperado al intentar iniciar sesión.";

  // Mapear los errores más comunes de NextAuth
  let errorMessage = error;
  if (error === "Configuration") {
    errorMessage = "Hay un problema en la configuración del servidor de autenticación.";
  } else if (error === "AccessDenied") {
    errorMessage = "No tienes permiso para acceder. Se denegó la autorización.";
  } else if (error === "Verification") {
    errorMessage = "El enlace de verificación ha expirado o ya fue usado.";
  } else if (error === "OAuthSignin" || error === "OAuthCallback" || error === "OAuthCreateAccount" || error === "EmailCreateAccount" || error === "Callback" || error === "OAuthAccountNotLinked" || error === "EmailSignin" || error === "CredentialsSignin") {
    errorMessage = "Error al intentar iniciar sesión con el proveedor externo.";
  } else if (error === "SessionRequired") {
    errorMessage = "Debes iniciar sesión para acceder a esta página.";
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-stone-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(180,184,171,0.34),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(40,75,99,0.1),_transparent_35%),linear-gradient(180deg,_#eef0eb,_#f4f9e9)]" />
      
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 text-center shadow-xl border border-[#153243]/10">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        
        <h1 className="font-display text-2xl font-black text-[#153243] mb-3">
          Autenticación cancelada
        </h1>
        
        <p className="text-[#284B63] mb-8 text-sm">
          {errorMessage}
        </p>

        <Link 
          href="/auth/login" 
          className="inline-block w-full text-center bg-[#284B63] hover:bg-[#153243] text-[#F4F9E9] font-bold py-3.5 rounded-2xl transition-colors shadow-sm"
        >
          Volver a Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
