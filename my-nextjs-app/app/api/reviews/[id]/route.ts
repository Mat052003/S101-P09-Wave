// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ── PATCH: anfitrión responde una reseña ────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const { ownerReply } = await req.json();

  const review = await prisma.review.findUnique({
    where: { id },
    include: { hotel: true },
  });

  if (!review) return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });

  // Solo el dueño del hotel puede responder
  if (review.hotel.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Solo el anfitrión puede responder" }, { status: 403 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      ownerReply:   ownerReply.trim(),
      ownerReplyAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}

// ── POST: reportar reseña ───────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const { reason } = await req.json();

  if (!reason || reason.trim().length < 5) {
    return NextResponse.json({ error: "Indica un motivo" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({
    where: { id },
    include: { hotel: true },
  });

  if (!review) return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });

  // Solo el dueño del hotel puede reportar
  if (review.hotel.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Solo el anfitrión puede reportar" }, { status: 403 });
  }

  const report = await prisma.reviewReport.create({
    data: {
      reviewId: id,
      userId:   session.user.id,
      reason:   reason.trim(),
    },
  });

  return NextResponse.json(report);
}
