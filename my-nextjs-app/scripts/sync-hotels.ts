import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Google Places API (New) types ────────────────────────────────
interface PlaceLocation {
  latitude: number;
  longitude: number;
}

interface PlacePhoto {
  name: string; // e.g. "places/{place_id}/photos/{photo_ref}"
}

interface PlaceNew {
  id: string;           // placeId
  displayName: { text: string };
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  location: PlaceLocation;
  photos?: PlacePhoto[];
  priceLevel?: string;
  types?: string[];
  shortFormattedAddress?: string;
}

interface PlacesNewSearchResponse {
  places?: PlaceNew[];
}

const CHILE_SEARCHES = [
  "boutique hotel Arica Chile",
  "boutique hotel Iquique Chile",
  "boutique hotel Antofagasta Chile",
  "boutique hotel Copiapó Chile",
  "boutique hotel La Serena Chile",
  "boutique hotel Valparaíso Chile",
  "boutique hotel Viña del Mar Chile",
  "boutique hotel Santiago Chile",
  "boutique hotel Rancagua Chile",
  "boutique hotel Talca Chile",
  "boutique hotel Chillán Chile",
  "boutique hotel Concepción Chile",
  "boutique hotel Temuco Chile",
  "boutique hotel Valdivia Chile",
  "boutique hotel Osorno Chile",
  "boutique hotel Puerto Varas Chile",
  "boutique hotel Puerto Montt Chile",
  "boutique hotel Chiloé Chile",
  "boutique hotel Coyhaique Chile",
  "boutique hotel Punta Arenas Chile",
  "boutique hotel Puerto Natales Chile",
  "boutique hotel Torres del Paine Chile",
  "boutique hotel San Pedro de Atacama Chile",
  "boutique hotel Rapa Nui Isla de Pascua",
];

function priceLevelToPrice(level?: string): number {
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 60,
    PRICE_LEVEL_INEXPENSIVE: 100,
    PRICE_LEVEL_MODERATE: 160,
    PRICE_LEVEL_EXPENSIVE: 280,
    PRICE_LEVEL_VERY_EXPENSIVE: 480,
  };
  return map[level ?? "PRICE_LEVEL_MODERATE"] ?? 160;
}

function deriveExperience(name: string, types: string[] = []): string {
  const n = name.toLowerCase();
  if (n.includes("spa") || n.includes("wellness") || n.includes("terma")) return "WELLNESS";
  if (n.includes("wine") || n.includes("gastro") || n.includes("vino")) return "GASTRONOMIC";
  if (n.includes("adventure") || n.includes("trekking") || n.includes("patagonia") || n.includes("torres")) return "ADVENTURE";
  if (n.includes("romantic") || n.includes("honeymoon")) return "ROMANTIC";
  if (n.includes("cultural") || n.includes("heritage") || n.includes("historic")) return "CULTURAL";
  return "RELAX";
}

function buildNewPhotoUrl(photoName: string, maxWidth = 800): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
}

async function searchPlacesNew(query: string, apiKey: string): Promise<PlaceNew[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.rating,places.userRatingCount,places.location,places.photos,places.priceLevel,places.types",
    },
    body: JSON.stringify({
      textQuery: query,
      includedType: "lodging",
      languageCode: "en",
      maxResultCount: 20,
      locationBias: {
        rectangle: {
          low: { latitude: -55.0, longitude: -76.0 },
          high: { latitude: -17.5, longitude: -66.0 },
        },
      },
    }),
  });

  if (!res.ok) {
    console.error(`Places API error for "${query}":`, await res.text());
    return [];
  }

  const data = (await res.json()) as PlacesNewSearchResponse;
  return data.places ?? [];
}

async function main() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("No API KEY found in environment");
    process.exit(1);
  }

  console.log("Starting sync with Google Places API...");
  const allPlaces: PlaceNew[] = [];

  for (const query of CHILE_SEARCHES) {
    console.log(`Searching for: ${query}`);
    const results = await searchPlacesNew(query, apiKey);
    allPlaces.push(...results);
    await new Promise((r) => setTimeout(r, 200));
  }

  const unique = Array.from(new Map(allPlaces.map((p) => [p.id, p])).values());
  let upserted = 0;
  let skipped = 0;

  for (const place of unique) {
    if (!place.rating || (place.userRatingCount ?? 0) < 5) {
      skipped++;
      continue;
    }

    const name = place.displayName.text;
    const locationText = place.shortFormattedAddress ?? place.formattedAddress.split(",")[0];
    const images = (place.photos ?? []).slice(0, 6).map((p) => buildNewPhotoUrl(p.name));
    const stars = Math.min(5, Math.max(3, Math.round(place.rating)));

    try {
      const existing = await prisma.hotel.findFirst({
        where: { googlePlaceId: place.id }
      });

      if (existing) {
        await prisma.hotel.update({
          where: { id: existing.id },
          data: {
            name,
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            images: images.length > 0 ? images : undefined,
          }
        });
      } else {
        await prisma.hotel.create({
          data: {
            name,
            description: `${name} is a boutique hotel located in ${locationText}, Chile. Rated ${place.rating?.toFixed(1)}★ by ${place.userRatingCount?.toLocaleString()} guests on Google Maps.`,
            location: locationText,
            experienceType: deriveExperience(name, place.types) as "RELAX" | "WELLNESS" | "GASTRONOMIC" | "ADVENTURE" | "ROMANTIC" | "CULTURAL",
            price: priceLevelToPrice(place.priceLevel),
            stars,
            services: ["WiFi", "Breakfast", "Concierge", "Room Service"],
            exclusiveFeatures: ["Google-verified property", `${place.rating?.toFixed(1)}★ Google rating`],
            images,
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            googlePlaceId: place.id,
            isActive: true,
          }
        });
      }
      upserted++;
    } catch (e) {
      console.error(`Failed to upsert hotel "${name}":`, e);
      skipped++;
    }
  }

  console.log(`Sync complete: ${upserted} hotels imported, ${skipped} skipped.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
