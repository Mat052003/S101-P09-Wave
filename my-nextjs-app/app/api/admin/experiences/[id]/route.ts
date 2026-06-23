// app/api/admin/experiences/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const exp = await prisma.experience.findUnique({ where: { id } });
  if (!exp || exp.ownerId !== session.user.id) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { name, description, price, duration, category, images, isActive, hotelIds } = await req.json();

  // Actualizar hoteles asignados
  if (hotelIds !== undefined) {
    await prisma.hotelExperience.deleteMany({ where: { experienceId: id } });
    if (hotelIds.length > 0) {
      await prisma.hotelExperience.createMany({
        data: hotelIds.map((hotelId: string) => ({ hotelId, experienceId: id })),
      });
    }
  }

  const updated = await prisma.experience.update({
    where: { id },
    data: { name, description, price: price ? Number(price) : undefined, duration, category, images, isActive },
    include: { hotels: { include: { hotel: { select: { id: true, name: true } } } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const exp = await prisma.experience.findUnique({ where: { id } });
  if (!exp || exp.ownerId !== session.user.id) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  await prisma.experience.delete({ where: { id } });
  return NextResponse.json({ message: "Eliminada" });
}