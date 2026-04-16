import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hotelIds = Array.isArray(body?.hotelIds)
      ? (body.hotelIds as string[]).filter(Boolean)
      : [];

    if (hotelIds.length < 2) {
      return NextResponse.json(
        { error: "Selecciona al menos 2 hoteles para comparar" },
        { status: 400 }
      );
    }

    if (hotelIds.length > 3) {
      return NextResponse.json(
        { error: "Puedes comparar hasta 3 hoteles a la vez" },
        { status: 400 }
      );
    }

    const hotels = await prisma.hotel.findMany({
      where: { id: { in: hotelIds } },
    });

    if (hotels.length !== hotelIds.length) {
      return NextResponse.json(
        { error: "Uno o más hoteles no existen" },
        { status: 404 }
      );
    }

    const comparison = {
      prices: hotels.map((hotel) => ({ id: hotel.id, name: hotel.name, value: hotel.price })),
      stars: hotels.map((hotel) => ({ id: hotel.id, name: hotel.name, value: hotel.stars })),
      experience: hotels.map((hotel) => ({ id: hotel.id, name: hotel.name, value: hotel.experienceType })),
      services: hotels.map((hotel) => ({ id: hotel.id, name: hotel.name, value: hotel.services })),
      exclusiveFeatures: hotels.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        value: hotel.exclusiveFeatures,
      })),
    };

    return NextResponse.json({ hotels, comparison });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al comparar hoteles" }, { status: 500 });
  }
}
