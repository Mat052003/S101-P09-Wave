import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const normalizedName = (name as string | undefined)?.trim();
    const normalizedEmail = (email as string | undefined)?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!PASSWORD_POLICY.test(password)) {
      return NextResponse.json(
        {
          error:
            "La contraseña debe tener minimo 8 caracteres, incluir mayuscula, minuscula, numero y simbolo.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser?.password) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: existingUser.name ?? normalizedName,
            password: hashedPassword,
          },
        })
      : await prisma.user.create({
          data: { name: normalizedName, email: normalizedEmail, password: hashedPassword },
        });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await prisma.otpCode.create({
      data: { userId: user.id, code: otpCode, expiresAt },
    });

    console.log(`OTP para ${normalizedEmail}: ${otpCode}`);

    return NextResponse.json({
      message: existingUser
        ? "Cuenta actualizada con contraseña. Revisa tu email para el código OTP."
        : "Usuario creado. Revisa tu email para el código OTP.",
      ...(process.env.NODE_ENV === "development" && { otpCode }),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
