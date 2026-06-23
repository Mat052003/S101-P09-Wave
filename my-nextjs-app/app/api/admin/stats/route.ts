// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  // Hoteles del admin
  const hotels = await prisma.hotel.findMany({
    where: { ownerId: session.user.id },
    include: {
      reservations: {
        include: { extras: true },
      },
    },
  });

  const allReservations = hotels.flatMap((h) => h.reservations);

  const totalRevenue = allReservations
    .filter((r) => r.status !== "CANCELLED")
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const avgPrice = hotels.length > 0
    ? hotels.reduce((sum, h) => sum + h.price, 0) / hotels.length
    : 0;

  // Datos por mes (últimos 6 meses)
  const months: { month: string; reservations: number; revenue: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("es-CL", { month: "short" });
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const monthRes = allReservations.filter((r) => {
      const created = new Date(r.createdAt);
      return created >= start && created <= end && r.status !== "CANCELLED";
    });

    months.push({
      month:        label,
      reservations: monthRes.length,
      revenue:      monthRes.reduce((sum, r) => sum + r.totalPrice, 0),
    });
  }

  // Stats por hotel
  const hotelStats = hotels.map((h) => {
    const res     = h.reservations.filter((r) => r.status !== "CANCELLED");
    const revenue = res.reduce((sum, r) => sum + r.totalPrice, 0);
    // Ocupación aproximada: reservas confirmadas / (totalRooms * 30 días)
    const occupancy = h.totalRooms > 0
      ? Math.min(100, (res.length / (h.totalRooms * 0.3)) * 100)
      : 0;
    return { name: h.name, reservations: res.length, revenue, occupancy };
  }).sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({
    totalHotels:           hotels.length,
    totalReservations:     allReservations.length,
    confirmedReservations: allReservations.filter((r) => r.status === "CONFIRMED").length,
    pendingReservations:   allReservations.filter((r) => r.status === "PENDING").length,
    totalRevenue,
    avgPrice,
    monthlyData: months,
    hotelStats,
  });
}