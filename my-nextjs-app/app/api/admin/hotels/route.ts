// app/api/admin/hotels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo anfitriones" }, { status: 403 });
  }

  const hotels = await prisma.hotel.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { reservations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(hotels);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo anfitriones pueden crear hoteles" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name, description, location, experienceType,
      price, extraBedPrice, totalRooms, isActive, stars,
      services, exclusiveFeatures, images,
      latitude, longitude, address,
    } = body;

    if (!name || !description || !location || !price) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        description,
        location,
        experienceType: experienceType || "RELAX",
        price:         Number(price),
        extraBedPrice: Number(extraBedPrice) || 50,
        totalRooms:    Number(totalRooms) || 10,
        isActive:      isActive ?? true,
        stars:         Number(stars) || 5,
        services:          services || [],
        exclusiveFeatures: exclusiveFeatures || [],
        images:            images || [],
        latitude:  latitude  ? Number(latitude)  : null,
        longitude: longitude ? Number(longitude) : null,
        address:   address   || null,
        ownerId:   session.user.id,
      },
    });

    return NextResponse.json(hotel);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear el hotel" }, { status: 500 });
  }
}