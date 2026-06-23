import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Looking for ADMIN users...");
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" }
  });

  if (admins.length === 0) {
    console.log("No admins found!");
    return;
  }

  console.log(`Found ${admins.length} admins. Fetching some hotels...`);
  const hotels = await prisma.hotel.findMany({ take: 5 });

  if (hotels.length === 0) {
    console.log("No hotels found!");
    return;
  }

  for (const admin of admins) {
    console.log(`Injecting past reservations for admin: ${admin.email}`);
    for (const hotel of hotels) {
      // Check if one already exists
      const existing = await prisma.reservation.findFirst({
        where: { userId: admin.id, hotelId: hotel.id }
      });
      if (!existing) {
        // Create a past confirmed reservation
        const pastCheckIn = new Date();
        pastCheckIn.setDate(pastCheckIn.getDate() - 10);
        const pastCheckOut = new Date();
        pastCheckOut.setDate(pastCheckOut.getDate() - 5);

        await prisma.reservation.create({
          data: {
            userId: admin.id,
            hotelId: hotel.id,
            checkIn: pastCheckIn,
            checkOut: pastCheckOut,
            guests: 2,
            totalPrice: hotel.price * 5,
            status: "CONFIRMED"
          }
        });
        console.log(`- Injected reservation for hotel: ${hotel.name}`);
      } else {
        // If it exists, ensure it's past and confirmed
        const pastCheckOut = new Date();
        pastCheckOut.setDate(pastCheckOut.getDate() - 5);
        await prisma.reservation.update({
          where: { id: existing.id },
          data: { status: "CONFIRMED", checkOut: pastCheckOut }
        });
        // also delete any existing reviews so they can test it again
        await prisma.review.deleteMany({
          where: { reservationId: existing.id }
        });
        console.log(`- Updated existing reservation for hotel: ${hotel.name} and deleted old reviews`);
      }
    }
  }
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
