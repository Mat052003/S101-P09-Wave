import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

// ── Configurar transporter de Nodemailer ─────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Template del email OTP ───────────────────────────────────
function getOtpEmailHtml(otpCode: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#EEF0EB; font-family:'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF0EB; padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background-color:#F4F9E9; border-radius:24px; overflow:hidden; border:1px solid rgba(21,50,67,0.12);">

              <!-- Header -->
              <tr>
                <td style="background-color:#153243; padding:32px 40px; text-align:center;">
                  <h1 style="margin:0; color:#F4F9E9; font-size:32px; font-weight:900; letter-spacing:-1px;">
                    Wave<span style="color:#B4B8AB;">.</span>
                  </h1>
                  <p style="margin:8px 0 0; color:rgba(244,249,233,0.7); font-size:12px; letter-spacing:3px; text-transform:uppercase;">
                    Boutique Hotels
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="margin:0 0 8px; color:#284B63; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:2px;">
                    Verificación de acceso
                  </p>
                  <h2 style="margin:0 0 20px; color:#153243; font-size:24px; font-weight:800;">
                    Hola, ${userName} 👋
                  </h2>
                  <p style="margin:0 0 28px; color:#284B63; font-size:15px; line-height:1.6;">
                    Tu código de verificación para acceder a Wave es:
                  </p>

                  <!-- OTP Code -->
                  <div style="background-color:#153243; border-radius:16px; padding:28px; text-align:center; margin-bottom:28px;">
                    <p style="margin:0 0 8px; color:rgba(244,249,233,0.6); font-size:11px; letter-spacing:3px; text-transform:uppercase;">
                      Código OTP
                    </p>
                    <p style="margin:0; color:#F4F9E9; font-size:42px; font-weight:900; letter-spacing:12px;">
                      ${otpCode}
                    </p>
                  </div>

                  <p style="margin:0 0 16px; color:#284B63; font-size:13px; line-height:1.6;">
                    ⏱️ Este código expira en <strong>10 minutos</strong>.
                  </p>
                  <p style="margin:0; color:#284B63; font-size:13px; line-height:1.6;">
                    Si no solicitaste este código, ignora este mensaje. Tu cuenta está segura.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#EEF0EB; padding:24px 40px; text-align:center; border-top:1px solid rgba(21,50,67,0.1);">
                  <p style="margin:0; color:#284B63; font-size:12px; opacity:0.6;">
                    Wave Boutique Hotels · Este es un mensaje automático, no respondas este correo.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

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

    // Invalidar OTPs anteriores
    await prisma.otpCode.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generar nuevo OTP
    const otpCode  = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
      data: { userId: user.id, code: otpCode, expiresAt },
    });

    // ── Enviar email ─────────────────────────────────────────
    await transporter.sendMail({
      from:    `"Wave Boutique Hotels" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `${otpCode} es tu código de verificación Wave`,
      html:    getOtpEmailHtml(otpCode, user.name ?? "Usuario"),
    });

    return NextResponse.json({ message: "Código OTP enviado a tu correo." });
  } catch (error) {
    console.error("Error enviando OTP:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}