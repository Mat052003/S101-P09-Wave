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

    const rankingCategory = url.searchParams.get("rankingCategory")?.trim() ?? "";

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

    // Get hotels
    let hotels = await prisma.hotel.findMany({
      take: 200,
      where,
      orderBy: [{ price: "asc" }, { stars: "desc" }],
      include: {
        reviews: {
          select: { service: true, rating: true },
        },
      },
    });

    // If a ranking is selected, perform in-memory sort (Prisma does not easily support native order by avg)
    if (rankingCategory === "LUXURY") {
      // Luxury: highest price, then highest stars
      hotels = hotels.sort((a, b) => b.price - a.price || b.stars - a.stars);
    } else if (rankingCategory === "BEST_SERVICE") {
      // Best service: highest average service rating
      hotels = hotels.sort((a, b) => {
        const avgA = a.reviews.length > 0 ? a.reviews.reduce((sum, r) => sum + r.service, 0) / a.reviews.length : 0;
        const avgB = b.reviews.length > 0 ? b.reviews.reduce((sum, r) => sum + r.service, 0) / b.reviews.length : 0;
        return avgB - avgA;
      });
    } else if (rankingCategory === "TOP_RATED") {
      // Top rated: highest average general rating (local)
      hotels = hotels.sort((a, b) => {
        const avgA = a.reviews.length > 0 ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length : 0;
        const avgB = b.reviews.length > 0 ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length : 0;
        return avgB - avgA;
      });
    }

    // Remove reviews from the response to avoid overloading the payload
    const hotelsResponse = hotels.map(({ reviews, ...rest }) => rest);

    return NextResponse.json({ hotels: hotelsResponse });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al buscar hoteles" }, { status: 500 });
  }
}
