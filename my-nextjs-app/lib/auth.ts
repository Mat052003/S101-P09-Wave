// src/lib/auth.ts
// ─────────────────────────────────────────────────────────────────
// ELEMENTOS CRIPTOGRÁFICOS USADOS EN ESTE ARCHIVO:
//
// #1  bcrypt (hash + salt)   → hashear y verificar contraseñas
// #2  JWT sessionToken       → NextAuth firma cada sesión con HMAC-SHA256
//                              usando NEXTAUTH_SECRET como llave
// #3  OAuth2 tokens (SSO)    → Google devuelve access_token, id_token (JWT)
//                              y refresh_token firmados con RS256
// #4  CSPRNG OTP             → crypto.randomInt() usa el generador seguro
//                              del sistema operativo (no Math.random)
// ─────────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // Elemento criptográfico #2: NextAuth usa NEXTAUTH_SECRET para
  // firmar los JWT de sesión con HMAC-SHA256
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  providers: [
    // ── SSO con Google ────────────────────────────────────────────
    // Elemento criptográfico #3: Google usa OAuth2 + OpenID Connect.
    // Devuelve un id_token (JWT firmado con RS256 por Google)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── Login con email + contraseña ──────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
        otpCode: { label: "Código OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        // Elemento criptográfico #1: bcrypt.compare() verifica la
        // contraseña contra el hash almacenado (incluye salt)
        const passwordOk = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!passwordOk) return null;

        // ── Verificar OTP ─────────────────────────────────────────
        // Elemento criptográfico #4: el OTP fue generado con
        // crypto.randomInt() (CSPRNG) al momento del login
        if (credentials.otpCode) {
          const otp = await prisma.otpCode.findFirst({
            where: {
              userId: user.id,
              code: credentials.otpCode as string,
              used: false,
              expiresAt: { gt: new Date() },
            },
          });
          if (!otp) return null;
          await prisma.otpCode.update({
            where: { id: otp.id },
            data: { used: true },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
