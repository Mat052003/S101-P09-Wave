// src/app/dashboard/page.tsx
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

type DashboardSearchParams = {
  view?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, createdAt: true, role: true },
  });

  if (user?.role === "ADMIN" && resolvedSearchParams?.view !== "profile") {
    redirect("/admin");
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { hotel: { select: { name: true, location: true, stars: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statusLabel: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendiente", color: "bg-[#B4B8AB]/28 text-[#153243] border border-[#153243]/20" },
    CONFIRMED: { label: "Confirmada", color: "bg-[#F4F9E9] text-[#153243] border border-[#153243]/20" },
    CANCELLED: { label: "Cancelada", color: "bg-[#EEF0EB] text-[#153243] border border-[#153243]/25" },
  };

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/auth/login" });
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-[#153243]">
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(180,184,171,0.36),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(40,75,99,0.1),_transparent_36%),linear-gradient(180deg,_#eef0eb,_#f4f9e9)]" />

      <nav className="relative z-10 border-b border-[#153243]/15 px-6 h-16 flex items-center justify-between backdrop-blur">
        <Link href="/" className="text-xl font-black text-[#153243]">
          wave<span className="text-[#284B63]">.</span>
        </Link>
        <form action={handleSignOut}>
          <button className="text-sm text-[#284B63] hover:text-[#153243] font-semibold transition-colors">
            Cerrar sesión
          </button>
        </form>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-9">
        <section className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#284B63] border border-[#153243] flex items-center justify-center text-2xl font-bold text-[#F4F9E9]">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-[#153243]">{user?.name ?? "Usuario"}</h1>
              <p className="text-[#284B63]/85 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-[#EEF0EB] text-[#153243] px-2.5 py-1 rounded-full font-semibold border border-[#153243]/16">
                {user?.role === "ADMIN" ? "Admin" : "Usuario"}
              </span>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-7 border-t border-[#153243]/12">
            <div className="text-center rounded-2xl bg-[#EEF0EB] border border-[#153243]/16 p-4">
              <p className="text-2xl font-black text-[#153243]">{reservations.length}</p>
              <p className="text-xs text-[#284B63]/85 uppercase tracking-[0.16em] mt-1">Reservas</p>
            </div>
            <div className="text-center rounded-2xl bg-[#EEF0EB] border border-[#153243]/16 p-4">
              <p className="text-2xl font-black text-[#153243]">
                {reservations.filter((r) => r.status === "CONFIRMED").length}
              </p>
              <p className="text-xs text-[#284B63]/85 uppercase tracking-[0.16em] mt-1">Confirmadas</p>
            </div>
            <div className="text-center rounded-2xl bg-[#EEF0EB] border border-[#153243]/16 p-4">
              <p className="text-2xl font-black text-[#153243]">
                ${reservations.reduce((sum, r) => sum + r.totalPrice, 0).toFixed(0)}
              </p>
              <p className="text-xs text-[#284B63]/85 uppercase tracking-[0.16em] mt-1">Total gastado</p>
            </div>
          </div>

        </section>

        <section>
          <h2 className="font-display text-3xl font-semibold text-[#153243] mb-4">Historial de reservas</h2>

          {reservations.length === 0 ? (
            <div className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-12 text-center">
              <p className="text-[#153243] font-semibold">Aun no tienes reservas</p>
              <Link
                href="/"
                className="inline-block mt-4 border-2 border-[#153243] bg-[#284B63] text-[#F4F9E9] text-sm font-bold px-6 py-2.5 rounded-full transition hover:bg-[#153243]"
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
                    className="panel rounded-2xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-6 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#EEF0EB] border border-[#153243]/18 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#284B63]">
                        Stay
                      </div>
                      <div>
                        <p className="font-bold text-[#153243]">{res.hotel.name}</p>
                        <p className="text-xs uppercase tracking-[0.12em] text-[#284B63]/85">{res.hotel.location}</p>
                        <p className="text-xs text-[#284B63]/75 mt-0.5">
                          {new Date(res.checkIn).toLocaleDateString("es-CL")} →{" "}
                          {new Date(res.checkOut).toLocaleDateString("es-CL")} · {nights} noches
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-[#153243]">${res.totalPrice}</p>
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
