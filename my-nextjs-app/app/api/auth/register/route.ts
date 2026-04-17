// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, phone, country, city, businessName, taxId, bio } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Todos los campos obligatorios son requeridos" }, { status: 400 });
    }

    if (!["CLIENT", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // Validaciones extra para admin
    if (role === "ADMIN" && (!phone || !country || !city || !businessName)) {
      return NextResponse.json({ error: "Los datos del negocio son obligatorios para anfitriones" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    // Elemento criptográfico #1: hash bcrypt con salt de 12 rondas
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone:        phone        || null,
        country:      country      || null,
        city:         city         || null,
        businessName: businessName || null,
        taxId:        taxId        || null,
        bio:          bio          || null,
      },
    });

    // Elemento criptográfico #4: OTP con CSPRNG
    const otpCode   = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
      data: { userId: user.id, code: otpCode, expiresAt },
    });

    console.log(`OTP para ${email}: ${otpCode}`);

    return NextResponse.json({
      message: "Usuario creado correctamente.",
      ...(process.env.NODE_ENV === "development" && { otpCode }),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
