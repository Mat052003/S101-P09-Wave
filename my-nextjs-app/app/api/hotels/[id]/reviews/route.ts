// app/api/hotels/[id]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ── Strict types for Google Places API (New) ────────────────────────
interface GoogleAuthorAttribution {
  displayName: string;
  uri?: string;
  photoUri?: string;
}

interface GoogleReviewText {
  text: string;
  languageCode: string;
}

interface GooglePlaceReviewNew {
  name: string; // Resource name
  rating: number;
  text?: GoogleReviewText;
  originalText?: GoogleReviewText;
  authorAttribution: GoogleAuthorAttribution;
  publishTime: string;
}

interface GooglePlaceDetailsNew {
  id: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: GooglePlaceReviewNew[];
}

// ── GET: get hotel reviews (local + Google Maps) ─────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get hotel to retrieve googlePlaceId
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    select: { googlePlaceId: true },
  });

  const localReviews = await prisma.review.findMany({
    where: { hotelId: id },
    include: {
      user: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Tag local reviews with isGoogle: false
  const taggedLocalReviews = localReviews.map((r) => ({ ...r, isGoogle: false as const }));

  // Calculate local stats
  const total = taggedLocalReviews.length;
  const avgRating = total > 0 ? taggedLocalReviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const avgCleanliness = total > 0 ? taggedLocalReviews.reduce((s, r) => s + r.cleanliness, 0) / total : 0;
  const avgLocation = total > 0 ? taggedLocalReviews.reduce((s, r) => s + r.location, 0) / total : 0;
  const avgService = total > 0 ? taggedLocalReviews.reduce((s, r) => s + r.service, 0) / total : 0;

  let googleReviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    isGoogle: true;
    user: { name: string; image: string };
  }[] = [];
  let googleRating = 0;
  let googleTotalReviews = 0;

  // Sanitize placeId before using in URL
  const placeId = hotel?.googlePlaceId?.replace(/[^a-zA-Z0-9_-]/g, "");

  if (placeId && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    try {
      const gRes = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
        {
          headers: {
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": "id,rating,userRatingCount,reviews",
          },
        }
      );

      if (gRes.ok) {
        const gData = (await gRes.json()) as GooglePlaceDetailsNew;

        if (gData.reviews) {
          googleReviews = gData.reviews.map((gr) => ({
            id: gr.name,
            rating: gr.rating,
            comment: gr.text?.text ?? gr.originalText?.text ?? "",
            createdAt: gr.publishTime,
            isGoogle: true as const,
            user: {
              name: gr.authorAttribution.displayName,
              image: gr.authorAttribution.photoUri ?? "",
            },
          }));
        }
        googleRating = gData.rating ?? 0;
        googleTotalReviews = gData.userRatingCount ?? 0;
      } else {
        console.error("Google Places API error:", await gRes.text());
      }
    } catch (e) {
      console.error("Error fetching Google Reviews", e);
    }
  }

  // Merge reviews sorted by date
  const allReviews = [...taggedLocalReviews, ...googleReviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({
    reviews: allReviews,
    stats: {
      total,
      avgRating,
      avgCleanliness,
      avgLocation,
      avgService,
      googleRating,
      googleTotalReviews,
    },
  });
}
