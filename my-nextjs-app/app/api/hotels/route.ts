import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ExperienceType, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const location = url.searchParams.get("location")?.trim() ?? "";
    const experienceType = url.searchParams.get("experienceType")?.trim() ?? "";
    const minPrice = Number(url.searchParams.get("minPrice") ?? 0);
    const maxPrice = Number(url.searchParams.get("maxPrice") ?? 1000000);
    const services = (url.searchParams.get("services") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const parsedExperienceType = Object.values(ExperienceType).includes(
      experienceType as ExperienceType
    )
      ? (experienceType as ExperienceType)
      : undefined;

    const where: Prisma.HotelWhereInput = {
      location: location
        ? {
            contains: location,
            mode: "insensitive",
          }
        : undefined,
      experienceType: parsedExperienceType
        ? {
            equals: parsedExperienceType,
          }
        : undefined,
      price: {
        gte: Number.isFinite(minPrice) ? minPrice : 0,
        lte: Number.isFinite(maxPrice) ? maxPrice : 1000000,
      },
      services: services.length > 0 ? { hasEvery: services } : undefined,
    };

    const hotels = await prisma.hotel.findMany({
      where,
      orderBy: [{ price: "asc" }, { stars: "desc" }],
    });

    return NextResponse.json({ hotels });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al buscar hoteles" }, { status: 500 });
  }
}
