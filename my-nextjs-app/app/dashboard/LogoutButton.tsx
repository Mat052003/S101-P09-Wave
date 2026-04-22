"use client";
// app/dashboard/LogoutButton.tsx

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors border border-slate-200 px-3 py-1.5 rounded-lg hover:border-slate-300"
    >
      Cerrar sesión
    </button>
  );
}
