// app/api/admin/extras/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const extras = await prisma.extraService.findMany({
    where: { ownerId: session.user.id },
    include: { hotels: { include: { hotel: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(extras);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  try {
    const { name, description, price, image, type, hotelIds } = await req.json();

    if (!name || !price || !type) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const extra = await prisma.extraService.create({
      data: {
        ownerId:     session.user.id,
        name,
        description: description || null,
        price:       Number(price),
        image:       image || null,
        type,
        hotels: {
          create: (hotelIds || []).map((hotelId: string) => ({ hotelId })),
        },
      },
      include: { hotels: { include: { hotel: { select: { id: true, name: true } } } } },
    });

    return NextResponse.json(extra);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}