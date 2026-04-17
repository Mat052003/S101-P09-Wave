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
    select: {
      id: true, name: true, email: true, image: true,
      role: true, phone: true, country: true, city: true,
      businessName: true, bio: true, createdAt: true,
    },
  });

  if (!user) redirect("/auth/login");

  // ── Dashboard según rol ──────────────────────────────────────
  if (user.role === "ADMIN") {
    return <AdminDashboard user={user} />;
  }
  return <ClientDashboard user={user} />;
}

// ─────────────────────────────────────────────────────────────────
// DASHBOARD CLIENTE
// ─────────────────────────────────────────────────────────────────
async function ClientDashboard({ user }: { user: any }) {
  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
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
      <nav className="bg-white border-b border-stone-100 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-stone-900">
          onda<span className="text-amber-500">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-stone-100 text-stone-600 px-3 py-1 rounded-full font-medium">🧳 Viajero</span>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Perfil */}
        <section className="bg-white rounded-2xl border border-stone-100 p-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600">
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{user.name}</h1>
              <p className="text-stone-400 text-sm">{user.email}</p>
              <p className="text-stone-400 text-xs mt-1">
                Miembro desde {new Date(user.createdAt).toLocaleDateString("es-CL")}
              </p>
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

        {/* Historial */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-900">Mis reservas</h2>
            <Link href="/" className="text-sm text-amber-500 font-semibold hover:text-amber-600 transition-colors">
              Explorar hoteles →
            </Link>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <p className="text-4xl mb-3">🏨</p>
              <p className="text-stone-500 font-medium">Aún no tienes reservas</p>
              <Link href="/"
                className="inline-block mt-4 bg-stone-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-amber-500 transition-colors">
                Explorar hoteles →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((res) => {
                const status = statusLabel[res.status] ?? statusLabel.PENDING;
                const nights = Math.ceil(
                  (new Date(res.checkOut).getTime() - new Date(res.checkIn).getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={res.id} className="bg-white rounded-2xl border border-stone-100 p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-xl">🏨</div>
                      <div>
                        <p className="font-bold text-stone-900">{res.hotel.name}</p>
                        <p className="text-xs text-stone-400">📍 {res.hotel.location}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {new Date(res.checkIn).toLocaleDateString("es-CL")} → {new Date(res.checkOut).toLocaleDateString("es-CL")} · {nights} noches
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-stone-900">${res.totalPrice}</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
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

// ─────────────────────────────────────────────────────────────────
// DASHBOARD ADMIN
// ─────────────────────────────────────────────────────────────────
async function AdminDashboard({ user }: { user: any }) {
  const hotels = await prisma.hotel.findMany({
    where: { ownerId: user.id },
    include: {
      reservations: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: { select: { reservations: true } },
    },
  });

  const totalReservations = hotels.reduce((sum, h) => sum + h._count.reservations, 0);
  const totalIncome = hotels.reduce((sum, h) =>
    sum + h.reservations.reduce((s, r) => s + r.totalPrice, 0), 0);

  const statusLabel: Record<string, { label: string; color: string }> = {
    PENDING:   { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "Confirmada", color: "bg-green-100 text-green-700"   },
    CANCELLED: { label: "Cancelada",  color: "bg-red-100 text-red-700"       },
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white border-b border-stone-100 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-stone-900">
          onda<span className="text-amber-500">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">🏨 Anfitrión</span>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Perfil negocio */}
        <section className="bg-white rounded-2xl border border-stone-100 p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">🏨</div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900">{user.businessName ?? user.name}</h1>
                <p className="text-stone-400 text-sm">{user.email}</p>
                <p className="text-stone-400 text-xs mt-1">
                  {user.city && user.country ? `📍 ${user.city}, ${user.country}` : ""}
                  {user.phone ? ` · 📞 ${user.phone}` : ""}
                </p>
              </div>
            </div>
            <Link href="/dashboard/hotel/new"
              className="bg-stone-900 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              + Agregar hotel
            </Link>
          </div>

          {user.bio && (
            <p className="mt-4 text-sm text-stone-500 leading-relaxed border-t border-stone-100 pt-4">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-stone-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-900">{hotels.length}</p>
              <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Hoteles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-900">{totalReservations}</p>
              <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Reservas recibidas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-900">${totalIncome.toFixed(0)}</p>
              <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">Ingresos totales</p>
            </div>
          </div>
        </section>

        {/* Mis hoteles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-900">Mis hoteles</h2>
            <Link href="/dashboard/hotel/new"
              className="text-sm text-amber-500 font-semibold hover:text-amber-600 transition-colors">
              + Publicar nuevo →
            </Link>
          </div>

          {hotels.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <p className="text-4xl mb-3">🏨</p>
              <p className="text-stone-500 font-medium">Aún no tienes hoteles publicados</p>
              <Link href="/dashboard/hotel/new"
                className="inline-block mt-4 bg-stone-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-amber-500 transition-colors">
                Publicar mi primer hotel →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-2xl border border-stone-100 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-stone-900">{hotel.name}</h3>
                      <p className="text-xs text-stone-400">📍 {hotel.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-900">${hotel.price}<span className="text-xs text-stone-400">/noche</span></p>
                      <p className="text-xs text-amber-500">{"★".repeat(hotel.stars)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <p className="text-xs text-stone-400">{hotel._count.reservations} reservas</p>
                    <Link href={`/dashboard/hotel/${hotel.id}`}
                      className="text-xs text-stone-600 hover:text-amber-500 font-semibold transition-colors">
                      Gestionar →
                    </Link>
                  </div>

                  {/* Últimas reservas del hotel */}
                  {hotel.reservations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Últimas reservas</p>
                      {hotel.reservations.slice(0, 3).map((res) => {
                        const status = statusLabel[res.status] ?? statusLabel.PENDING;
                        return (
                          <div key={res.id} className="flex items-center justify-between">
                            <p className="text-xs text-stone-600">{res.user.name ?? res.user.email}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
