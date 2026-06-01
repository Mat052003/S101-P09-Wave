// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { hotelId, checkIn, checkOut, guests, rooms = 1, extras } = await req.json();

    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    if (guests > 4) {
      return NextResponse.json({ error: "Máximo 4 huéspedes por habitación" }, { status: 400 });
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
    if (!hotel.isActive) return NextResponse.json({ error: "Hotel no disponible actualmente" }, { status: 400 });

    const inDate  = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (outDate <= inDate) {
      return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
    }

    // ── Validar disponibilidad ───────────────────────────────
    // 1. Verificar fechas bloqueadas
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        hotelId,
        date: { gte: inDate, lt: outDate },
      },
    });

    if (blockedDates.length > 0) {
      return NextResponse.json({
        error: "El hotel no está disponible en alguna de las fechas seleccionadas",
      }, { status: 400 });
    }

    // 2. Verificar habitaciones disponibles
    const overlapping = await prisma.reservation.findMany({
      where: {
        hotelId,
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [
          { checkIn:  { lt: outDate } },
          { checkOut: { gt: inDate  } },
        ],
      },
      select: { rooms: true },
    });

    const roomsOccupied  = overlapping.reduce((sum, r) => sum + r.rooms, 0);
    const roomsAvailable = hotel.totalRooms - roomsOccupied;

    if (rooms > roomsAvailable) {
      return NextResponse.json({
        error: `Solo quedan ${roomsAvailable} habitación${roomsAvailable === 1 ? "" : "es"} disponible${roomsAvailable === 1 ? "" : "s"} para esas fechas`,
        roomsAvailable,
      }, { status: 400 });
    }

    // ── Calcular precio ──────────────────────────────────────
    const nights      = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    const extraBeds   = Math.max(0, guests - 2);
    const pricePerRoom = hotel.price + (extraBeds * hotel.extraBedPrice);
    const baseTotal   = pricePerRoom * nights * rooms;
    const extrasTotal = (extras || []).reduce(
      (sum: number, e: { price: number; quantity: number }) => sum + e.price * e.quantity,
      0
    );

    const totalPrice = baseTotal + extrasTotal;

    const reservation = await prisma.reservation.create({
      data: {
        userId:    session.user.id,
        hotelId,
        checkIn:   inDate,
        checkOut:  outDate,
        guests:    guests || 1,
        rooms:     rooms || 1,
        totalPrice,
        status:    "PENDING",
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const reservations = await prisma.reservation.findMany({
    where:   { userId: session.user.id },
    include: { hotel: true, extras: true, review: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}
