import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        hotel: { select: { name: true } },
        user: { select: { name: true, email: true } },
        extras: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
  }
}
