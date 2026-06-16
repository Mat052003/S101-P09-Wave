// app/api/admin/hotels/[id]/blocked-dates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ── GET: obtener fechas bloqueadas ──────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blocked = await prisma.blockedDate.findMany({
    where: { hotelId: id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(blocked);
}

// ── POST: bloquear una fecha ────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const hotel  = await prisma.hotel.findUnique({ where: { id } });

  if (!hotel || hotel.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { date, reason } = await req.json();

  try {
    const blocked = await prisma.blockedDate.create({
      data: { hotelId: id, date: new Date(date), reason },
    });
    return NextResponse.json(blocked);
  } catch {
    return NextResponse.json({ error: "Fecha ya bloqueada" }, { status: 400 });
  }
}

// ── DELETE: desbloquear una fecha ────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id }   = await params;
  const { date } = await req.json();

  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel || hotel.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  await prisma.blockedDate.deleteMany({
    where: { hotelId: id, date: new Date(date) },
  });

  return NextResponse.json({ message: "Fecha desbloqueada" });
}
