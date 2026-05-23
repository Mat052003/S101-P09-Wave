// app/api/admin/hotels/[id]/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  // Verificar que el hotel pertenece al admin
  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
  if (hotel.ownerId !== session.user.id) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const reservations = await prisma.reservation.findMany({
    where: { hotelId: id },
    include: {
      user:   { select: { name: true, email: true } },
      extras: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}
