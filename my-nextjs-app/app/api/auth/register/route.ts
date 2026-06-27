import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

import nodemailer from "nodemailer";

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();
    const normalizedRole: "USER" | "ADMIN" =
      role === "ADMIN" ? "ADMIN" : "USER";
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
            role: normalizedRole,
          },
        })
      : await prisma.user.create({
          data: { name: normalizedName, email: normalizedEmail, password: hashedPassword, role: normalizedRole },
        });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await prisma.otpCode.create({
      data: { userId: user.id, code: otpCode, expiresAt },
    });

    console.log(`OTP para ${normalizedEmail}: ${otpCode}`);

    // Enviar correo con nodemailer
    try {
      let transporter;
      let fromAddress = '"Wave Boutique Hotels" <hello@wavehotels.com>';

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Usa las credenciales reales si están en el .env
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        fromAddress = `"Wave Boutique Hotels" <${process.env.SMTP_USER}>`;
      } else {
        // Para DEMOS: si no hay credenciales reales, crea un buzón falso automático (Ethereal)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        fromAddress = `"Wave Hotels (Test Demo)" <${testAccount.user}>`;
        console.log("-----------------------------------------");
        console.log("Aviso: Usando servidor de correo de prueba (Ethereal) para la DEMO.");
        console.log("-----------------------------------------");
      }

      const info = await transporter.sendMail({
        from: fromAddress,
        to: normalizedEmail,
        subject: "Tu código de verificación Wave",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; text-align: center;">
            <h2 style="color: #153243;">Verifica tu cuenta</h2>
            <p style="color: #284B63; font-size: 16px;">Usa el siguiente código de 6 dígitos para completar tu registro:</p>
            <div style="background-color: #EEF0EB; padding: 15px; border-radius: 10px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #153243; margin: 20px 0;">
              ${otpCode}
            </div>
            <p style="color: #284B63; font-size: 14px;">Este código expirará en 10 minutos.</p>
          </div>
        `,
      });

      if (!process.env.SMTP_USER) {
        console.log("✅ CORREO ENVIADO CORRECTAMENTE AL BUZÓN DE PRUEBA");
        console.log("👉 HAZ CLIC AQUÍ PARA VER EL CORREO COMO LLEGARÍA A LA BANDEJA: " + nodemailer.getTestMessageUrl(info));
      }
      
    } catch (emailError) {
      console.error("Error enviando email OTP:", emailError);
    }

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
