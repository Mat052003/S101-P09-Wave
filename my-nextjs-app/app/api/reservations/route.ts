// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ── Crear reserva ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { hotelId, checkIn, checkOut, guests, extras } = await req.json();

    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
    }

    const inDate  = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (outDate <= inDate) {
      return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
    }

    // Calcular noches y total
    const nights = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const baseTotal = hotel.price * nights;

    // Sumar extras
    const extrasTotal = (extras || []).reduce(
      (sum: number, e: { price: number; quantity: number }) => sum + e.price * e.quantity,
      0
    );

    const totalPrice = baseTotal + extrasTotal;

    const reservation = await prisma.reservation.create({
      data: {
        userId:     session.user.id,
        hotelId,
        checkIn:    inDate,
        checkOut:   outDate,
        guests:     guests || 1,
        totalPrice,
        status:     "PENDING",
        extras: {
          create: (extras || []).map((e: { type: string; price: number; quantity: number; notes?: string }) => ({
            type:     e.type as any,
            price:    e.price,
            quantity: e.quantity,
            notes:    e.notes,
          })),
        },
      },
      include: { extras: true, hotel: true },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ── Listar reservas del usuario ────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const reservations = await prisma.reservation.findMany({
    where:   { userId: session.user.id },
    include: { hotel: true, extras: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}
