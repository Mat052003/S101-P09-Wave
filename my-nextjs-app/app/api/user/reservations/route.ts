// src/app/api/user/reservations/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: {
      hotel: {
        select: { id: true, name: true, location: true, images: true, stars: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}
