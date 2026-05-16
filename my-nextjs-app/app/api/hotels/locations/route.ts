// app/api/hotels/locations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  // Obtener todas las ubicaciones únicas de los hoteles
  const hotels = await prisma.hotel.findMany({
    select: { location: true },
    distinct: ["location"],
    orderBy: { location: "asc" },
  });

  const locations = hotels.map((h) => h.location);

  return NextResponse.json({ locations });
}
