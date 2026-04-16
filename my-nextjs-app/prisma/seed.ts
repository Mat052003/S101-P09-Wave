import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hotels = [
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
