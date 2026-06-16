import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "Esta cuenta fue creada con Google. Puedes iniciar sesión con Google o completar tu registro para crear una contraseña.",
        },
        { status: 409 }
      );
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    await prisma.otpCode.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
      data: { userId: user.id, code: otpCode, expiresAt },
    });

    console.log(`OTP para ${email}: ${otpCode}`);

    return NextResponse.json({
      message: "Código OTP enviado.",
      ...(process.env.NODE_ENV === "development" && { otpCode }),
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
