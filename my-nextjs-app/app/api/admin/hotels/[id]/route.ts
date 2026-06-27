// app/api/admin/hotels/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const hotel = await prisma.hotel.findUnique({ where: { id }, include: { roomTypes: true } });

  if (!hotel) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Permitir si es dueño O si el hotel no tiene dueño (hoteles del seed)
  if (hotel.ownerId && hotel.ownerId !== session.user.id) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  return NextResponse.json(hotel);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const hotel = await prisma.hotel.findUnique({ where: { id } });

  if (!hotel) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (hotel.ownerId && hotel.ownerId !== session.user.id) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { roomTypes, ...fields } = body;

    const updated = await prisma.hotel.update({
      where: { id },
      data: {
        name: fields.name,
        description: fields.description,
        location: fields.location,
        experienceType: fields.experienceType,
        price:         fields.price         !== undefined ? Number(fields.price)         : undefined,
        extraBedPrice: fields.extraBedPrice !== undefined ? Number(fields.extraBedPrice) : undefined,
        totalRooms:    fields.totalRooms    !== undefined ? Number(fields.totalRooms)    : undefined,
        isActive:      fields.isActive      !== undefined ? fields.isActive              : undefined,
        stars:         fields.stars         !== undefined ? Number(fields.stars)         : undefined,
        services:          fields.services,
        exclusiveFeatures: fields.exclusiveFeatures,
        images:            fields.images,
        latitude:  fields.latitude  !== undefined ? (fields.latitude  ? Number(fields.latitude)  : null) : undefined,
        longitude: fields.longitude !== undefined ? (fields.longitude ? Number(fields.longitude) : null) : undefined,
        address:   fields.address   !== undefined ? (fields.address   || null)                           : undefined,
      },
    });

    if (Array.isArray(roomTypes)) {
      await prisma.roomType.deleteMany({ where: { hotelId: id } });
      if (roomTypes.length > 0) {
        await prisma.roomType.createMany({
          data: roomTypes.map((r: { name: string; capacity: number; count: number; pricePerNight: number; maxExtraBeds: number; extraBedPrice: number }) => ({
            hotelId:       id,
            name:          r.name,
            capacity:      Number(r.capacity),
            count:         Number(r.count),
            pricePerNight: Number(r.pricePerNight),
            maxExtraBeds:  Number(r.maxExtraBeds),
            extraBedPrice: Number(r.extraBedPrice),
          })),
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const hotel = await prisma.hotel.findUnique({ where: { id } });

  if (!hotel) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (hotel.ownerId && hotel.ownerId !== session.user.id) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  await prisma.hotel.delete({ where: { id } });
  return NextResponse.json({ message: "Hotel eliminado" });
}
