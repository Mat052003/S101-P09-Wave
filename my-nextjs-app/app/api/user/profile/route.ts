// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — obtener perfil del usuario autenticado
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

// PATCH — actualizar nombre e imagen
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { name, image } = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, image },
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json(updated);
}
