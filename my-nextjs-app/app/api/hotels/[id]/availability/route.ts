// app/api/hotels/[id]/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ── GET: disponibilidad del hotel para un rango de fechas ──
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }     = await params;
  const { searchParams } = req.nextUrl;
  const checkIn    = searchParams.get("checkIn");
  const checkOut   = searchParams.get("checkOut");

  const hotel = await prisma.hotel.findUnique({
    where: { id },
    select: { totalRooms: true, isActive: true },
  });

  if (!hotel) return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
  if (!hotel.isActive) return NextResponse.json({ available: false, reason: "Hotel no disponible" });

  if (!checkIn || !checkOut) {
    return NextResponse.json({ totalRooms: hotel.totalRooms, isActive: hotel.isActive });
  }

  const inDate  = new Date(checkIn);
  const outDate = new Date(checkOut);

  // Contar reservas activas que se solapan con el rango pedido
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      hotelId: id,
      status:  { in: ["PENDING", "CONFIRMED"] },
      AND: [
        { checkIn:  { lt: outDate } },
        { checkOut: { gt: inDate  } },
      ],
    },
    select: { rooms: true },
  });

  const roomsOccupied = overlappingReservations.reduce((sum, r) => sum + r.rooms, 0);
  const roomsAvailable = hotel.totalRooms - roomsOccupied;

  // Fechas bloqueadas por el anfitrión en ese rango
  const blockedDates = await prisma.blockedDate.findMany({
    where: {
      hotelId: id,
      date: {
        gte: inDate,
        lt:  outDate,
      },
    },
  });

  return NextResponse.json({
    totalRooms:      hotel.totalRooms,
    roomsOccupied,
    roomsAvailable,
    isActive:        hotel.isActive,
    available:       roomsAvailable > 0 && blockedDates.length === 0,
    lowAvailability: roomsAvailable <= 3 && roomsAvailable > 0,
    blockedDates:    blockedDates.map((b) => b.date),
  });
}
