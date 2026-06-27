// app/api/reservations/[id]/extras/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { hotel: true },
  });

  if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });

  if (reservation.hotel.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const body = await req.json();

  const extra = await prisma.reservationExtra.create({
    data: {
      reservationId:  id,
      extraServiceId: body.extraServiceId ?? null,
      experienceId:   body.experienceId   ?? null,
      name:           body.name           ?? null,
      price:          Number(body.price   ?? 0),
      quantity:       Number(body.quantity ?? 1),
      notes:          body.notes          ?? null,
      type:           body.type           ?? null,
    },
  });

  return NextResponse.json(extra, { status: 201 });
}
