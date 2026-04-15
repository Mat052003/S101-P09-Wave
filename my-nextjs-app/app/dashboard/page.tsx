// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, createdAt: true, role: true },
  });

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { hotel: { select: { name: true, location: true, stars: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statusLabel: Record<string, { label: string; color: string }> = {
    PENDING:   { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "Confirmada", color: "bg-green-100 text-green-700"   },
    CANCELLED: { label: "Cancelada",  color: "bg-red-100 text-red-700"       },
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-stone-100 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-stone-900">
          onda<span className="text-amber-500">.</span>
        </Link>
        <LogoutButton />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* ── Perfil ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-stone-100 p-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{user?.name ?? "Usuario"}</h1>
              <p className="text-stone-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                {user?.role === "ADMIN" ? "👑 Admin" : "👤 Usuario"}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-stone-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-900">{reservations.length}</p>
              <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Reservas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-900">
                {reservations.filter((r) => r.status === "CONFIRMED").length}
              </p>
              <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Confirmadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-900">
                ${reservations.reduce((sum, r) => sum + r.totalPrice, 0).toFixed(0)}
              </p>
              <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Total gastado</p>
            </div>
          </div>
        </section>

        {/* ── Historial de reservas ───────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-4">Historial de reservas</h2>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <p className="text-4xl mb-3">🏨</p>
              <p className="text-stone-500 font-medium">Aún no tienes reservas</p>
              <Link
                href="/"
                className="inline-block mt-4 bg-stone-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-amber-500 transition-colors"
              >
                Explorar hoteles →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((res) => {
                const status = statusLabel[res.status] ?? statusLabel.PENDING;
                const nights = Math.ceil(
                  (new Date(res.checkOut).getTime() - new Date(res.checkIn).getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-2xl border border-stone-100 p-6 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-xl">
                        🏨
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{res.hotel.name}</p>
                        <p className="text-xs text-stone-400">📍 {res.hotel.location}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {new Date(res.checkIn).toLocaleDateString("es-CL")} →{" "}
                          {new Date(res.checkOut).toLocaleDateString("es-CL")} · {nights} noches
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-stone-900">${res.totalPrice}</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
