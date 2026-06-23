import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const experiences = await prisma.experience.findMany({
    where: { ownerId: session.user.id },
    include: {
      hotels: { include: { hotel: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(experiences);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { name, description, price, duration, category, images, hotelIds } = await req.json();

  if (!name || !description || !price) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const experience = await prisma.experience.create({
    data: {
      ownerId: session.user.id,
      name,
      description,
      price: Number(price),
      duration: duration || null,
      category: category || "ACTIVITY",
      images: images || [],
      hotels: {
        create: (hotelIds || []).map((hotelId: string) => ({ hotelId })),
      },
    },
    include: {
      hotels: { include: { hotel: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(experience);
}