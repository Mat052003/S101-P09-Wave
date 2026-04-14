// src/app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // No revelar si el email existe o no (seguridad)
      return NextResponse.json({ message: "Si el email existe, recibirás un código." });
    }

    // Invalidar OTPs anteriores del usuario
    await prisma.otpCode.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Elemento criptográfico #4: nuevo OTP con CSPRNG
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
      data: { userId: user.id, code: otpCode, expiresAt },
    });

    // En producción: enviar por email aquí
    console.log(`OTP para ${email}: ${otpCode}`);

    return NextResponse.json({
      message: "Código OTP enviado.",
      ...(process.env.NODE_ENV === "development" && { otpCode }),
    });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
