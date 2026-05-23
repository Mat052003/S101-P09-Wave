// app/api/admin/reservations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id }    = await params;
  const { status } = await req.json();

  if (!["CONFIRMED", "CANCELLED"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { hotel: true },
  });

  if (!reservation) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (reservation.hotel.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data:  { status },
  });

  return NextResponse.json(updated);
}
