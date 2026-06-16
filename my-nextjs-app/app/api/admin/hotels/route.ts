// app/api/admin/hotels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ── GET: listar hoteles del anfitrión ───────────────────────────
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

// ── POST: crear hotel ────────────────────────────────────────────
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
      price, extraBedPrice, stars,
      services, exclusiveFeatures, images,
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
        price: Number(price),
        extraBedPrice: Number(extraBedPrice) || 50,
        stars: Number(stars) || 5,
        services: services || [],
        exclusiveFeatures: exclusiveFeatures || [],
        images: images || [],
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(hotel);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear el hotel" }, { status: 500 });
  }
}
