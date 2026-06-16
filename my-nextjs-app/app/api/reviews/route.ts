// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ── POST: crear reseña ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { reservationId, cleanliness, location, service, comment } = await req.json();

    if (!reservationId || !cleanliness || !location || !service || !comment) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Verificar que la reserva existe, pertenece al usuario y está confirmada
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { review: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    if (reservation.userId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
    }
    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Solo puedes reseñar reservas confirmadas" }, { status: 400 });
    }
    if (reservation.review) {
      return NextResponse.json({ error: "Ya dejaste una reseña para esta reserva" }, { status: 400 });
    }

    // Validar que los ratings estén entre 1-5
    const ratings = [cleanliness, location, service];
    if (ratings.some((r) => r < 1 || r > 5)) {
      return NextResponse.json({ error: "Ratings deben estar entre 1 y 5" }, { status: 400 });
    }

    // Promedio de las 3 categorías
    const rating = Math.round((cleanliness + location + service) / 3);

    const review = await prisma.review.create({
      data: {
        hotelId:       reservation.hotelId,
        userId:        session.user.id,
        reservationId: reservation.id,
        rating,
        cleanliness,
        location,
        service,
        comment:       comment.trim(),
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
