import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run prisma seed");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const hotels: Prisma.HotelCreateInput[] = [
    {
      name: "Casa Ladera Boutique",
      description: "Urban boutique hotel with mountain view suites and private terraces.",
      location: "Santiago",
      experienceType: "ROMANTIC",
      price: 280,
      stars: 5,
      services: ["Spa", "Rooftop", "Airport Transfer"],
      exclusiveFeatures: ["Private terrace", "In-room aroma ritual"],
      images: [],
    },
    {
      name: "Vina Secreta Lodge",
      description: "Countryside retreat between vineyards with guided tastings and chef pairings.",
      location: "Valparaiso",
      experienceType: "GASTRONOMIC",
      price: 340,
      stars: 5,
      services: ["Winery", "Chef Table", "Pool"],
      exclusiveFeatures: ["Reserve wine cellar", "Sunset tasting"],
      images: [],
    },
    {
      name: "Bosque Termal House",
      description: "Forest cabins with thermal circuits, yoga decks and wellness programs.",
      location: "Pucon",
      experienceType: "WELLNESS",
      price: 220,
      stars: 4,
      services: ["Spa", "Yoga", "Pool"],
      exclusiveFeatures: ["Thermal ritual", "Guided breathwork"],
      images: [],
    },
    {
      name: "Risco Aventura Suites",
      description: "Design lodge next to national park trails, ideal for active travelers.",
      location: "Torres del Paine",
      experienceType: "ADVENTURE",
      price: 300,
      stars: 4,
      services: ["Airport Transfer", "Pet Friendly"],
      exclusiveFeatures: ["Expedition concierge", "Private trekking routes"],
      images: [],
    },
    {
      name: "Puerto Cobre House",
      description: "Heritage-style boutique stay in the hills with curated local design details.",
      location: "Valparaiso",
      experienceType: "CULTURAL",
      price: 210,
      stars: 4,
      services: ["Rooftop", "Airport Transfer"],
      exclusiveFeatures: ["Artisan breakfast", "Local gallery circuit"],
      images: [],
    },
    {
      name: "Lago Espejo Retreat",
      description: "Calm lakeside property designed for disconnection and restorative routines.",
      location: "Puerto Varas",
      experienceType: "RELAX",
      price: 260,
      stars: 5,
      services: ["Spa", "Pool", "Yoga"],
      exclusiveFeatures: ["Floating sauna", "Sunrise meditation deck"],
      images: [],
    },
    {
      name: "Andes Sky Suites",
      description: "High-altitude suites with panoramic mountain views and premium service.",
      location: "Santiago",
      experienceType: "ROMANTIC",
      price: 390,
      stars: 5,
      services: ["Rooftop", "Spa", "Airport Transfer"],
      exclusiveFeatures: ["Private plunge pool", "Chef in-room dinner"],
      images: [],
    },
    {
      name: "Ruta del Vino Rooms",
      description: "Boutique vineyard rooms with tasting routes and regional pairings.",
      location: "Santa Cruz",
      experienceType: "GASTRONOMIC",
      price: 240,
      stars: 4,
      services: ["Winery", "Chef Table", "Pet Friendly"],
      exclusiveFeatures: ["Barrel tasting room", "Seasonal pairing menu"],
      images: [],
    },
    {
      name: "Patagonia Nativa Lodge",
      description: "Nature-forward lodge near trekking trails and remote scenic routes.",
      location: "Coyhaique",
      experienceType: "ADVENTURE",
      price: 275,
      stars: 4,
      services: ["Airport Transfer", "Pool"],
      exclusiveFeatures: ["Guided glacier daytrip", "Equipment-ready basecamp"],
      images: [],
    },
    {
      name: "Barrio Lastarria Atelier",
      description: "Urban cultural hideaway steps from theaters, museums and cafés.",
      location: "Santiago",
      experienceType: "CULTURAL",
      price: 195,
      stars: 4,
      services: ["Rooftop", "Pet Friendly"],
      exclusiveFeatures: ["Private city art walk", "Live jazz evenings"],
      images: [],
    },
    {
      name: "Termas del Sur Signature",
      description: "Wellness-centric thermal complex focused on recovery and deep rest.",
      location: "Pucon",
      experienceType: "WELLNESS",
      price: 320,
      stars: 5,
      services: ["Spa", "Yoga", "Pool"],
      exclusiveFeatures: ["Hydrotherapy circuit", "Sleep optimization suite"],
      images: [],
    },
    {
      name: "Costa Serena Boutique",
      description: "Minimalist coastal property for digital detox and ocean-side calm.",
      location: "La Serena",
      experienceType: "RELAX",
      price: 185,
      stars: 4,
      services: ["Pool", "Airport Transfer"],
      exclusiveFeatures: ["Sunset tea ritual", "Private beach cabanas"],
      images: [],
    },
    {
      name: "Nocturna Wine & Stars",
      description: "Boutique escape blending astronomy sessions with premium wine experiences.",
      location: "Elqui",
      experienceType: "GASTRONOMIC",
      price: 330,
      stars: 5,
      services: ["Winery", "Chef Table", "Rooftop"],
      exclusiveFeatures: ["Observatory lounge", "Night sky pairing tasting"],
      images: [],
    },
  ];

  for (const hotel of hotels) {
    const existing = await prisma.hotel.findFirst({
      where: { name: hotel.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.hotel.update({
        where: { id: existing.id },
        data: hotel,
      });
      continue;
    }

    await prisma.hotel.create({ data: hotel });
  }

  console.log(`Seed complete. Hotels loaded: ${hotels.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
