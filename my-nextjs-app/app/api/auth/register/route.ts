// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Elemento criptográfico #1: hashear contraseña con bcrypt
    // saltRounds: 12 → bcrypt genera un salt aleatorio y hashea
    // el resultado es irreversible: nunca se guarda la contraseña real
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Elemento criptográfico #4: generar OTP con CSPRNG
    // crypto.randomInt usa /dev/urandom (Linux) o CryptGenRandom (Windows)
    // Es impredecible — a diferencia de Math.random() que NO es seguro
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await prisma.otpCode.create({
      data: { userId: user.id, code: otpCode, expiresAt },
    });

    // En producción aquí enviarías el OTP por email (con Resend, Nodemailer, etc.)
    // Por ahora lo devolvemos en la respuesta para pruebas
    console.log(`OTP para ${email}: ${otpCode}`);

    return NextResponse.json({
      message: "Usuario creado. Revisa tu email para el código OTP.",
      // Solo en desarrollo — en producción NO devolver el OTP
      ...(process.env.NODE_ENV === "development" && { otpCode }),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
