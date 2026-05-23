// app/api/hotels/[id]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ── GET: obtener reseñas de un hotel ────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reviews = await prisma.review.findMany({
    where: { hotelId: id },
    include: {
      user: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calcular estadísticas
  const total = reviews.length;
  const avgRating = total > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / total
    : 0;
  const avgCleanliness = total > 0
    ? reviews.reduce((s, r) => s + r.cleanliness, 0) / total
    : 0;
  const avgLocation = total > 0
    ? reviews.reduce((s, r) => s + r.location, 0) / total
    : 0;
  const avgService = total > 0
    ? reviews.reduce((s, r) => s + r.service, 0) / total
    : 0;

  return NextResponse.json({
    reviews,
    stats: {
      total,
      avgRating,
      avgCleanliness,
      avgLocation,
      avgService,
    },
  });
}
