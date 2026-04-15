"use client";
// app/dashboard/LogoutButton.tsx

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="text-sm text-stone-500 hover:text-stone-900 font-medium transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
