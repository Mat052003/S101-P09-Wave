// app/api/admin/extras/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const extra = await prisma.extraService.findUnique({ where: { id } });
  if (!extra || extra.ownerId !== session.user.id) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { name, description, price, image, type, isActive, hotelIds } = await req.json();

  if (hotelIds !== undefined) {
    await prisma.hotelExtraService.deleteMany({ where: { extraServiceId: id } });
    if (hotelIds.length > 0) {
      await prisma.hotelExtraService.createMany({
        data: hotelIds.map((hotelId: string) => ({ hotelId, extraServiceId: id })),
      });
    }
  }

  const updated = await prisma.extraService.update({
    where: { id },
    data: { name, description, price: price ? Number(price) : undefined, image, type, isActive },
    include: { hotels: { include: { hotel: { select: { id: true, name: true } } } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const extra = await prisma.extraService.findUnique({ where: { id } });
  if (!extra || extra.ownerId !== session.user.id) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  await prisma.extraService.delete({ where: { id } });
  return NextResponse.json({ message: "Eliminado" });
}