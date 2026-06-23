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
  const hotel = await prisma.hotel.findUnique({ where: { id } });

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
    const updated = await prisma.hotel.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        experienceType: body.experienceType,
        price: body.price !== undefined ? Number(body.price) : undefined,
        extraBedPrice: body.extraBedPrice !== undefined ? Number(body.extraBedPrice) : undefined,
        totalRooms: body.totalRooms !== undefined ? Number(body.totalRooms) : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        stars: body.stars !== undefined ? Number(body.stars) : undefined,
        services: body.services,
        exclusiveFeatures: body.exclusiveFeatures,
        images: body.images,
        latitude: body.latitude !== undefined ? (body.latitude ? Number(body.latitude) : null) : undefined,
        longitude: body.longitude !== undefined ? (body.longitude ? Number(body.longitude) : null) : undefined,
        address: body.address !== undefined ? (body.address || null) : undefined,
      },
    });
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
