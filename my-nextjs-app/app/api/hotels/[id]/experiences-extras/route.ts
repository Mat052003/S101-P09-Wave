// app/api/hotels/[id]/experiences-extras/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: {
      experiences: {
        include: {
          experience: true,
        },
      },
      extraServices: {
        include: {
          extraService: true,
        },
      },
    },
  });

  if (!hotel) {
    return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
  }

  const experiences = hotel.experiences
    .map((he) => he.experience)
    .filter((e) => e.isActive);

  const extras = hotel.extraServices
    .map((hes) => hes.extraService)
    .filter((e) => e.isActive);

  return NextResponse.json({ experiences, extras });
}