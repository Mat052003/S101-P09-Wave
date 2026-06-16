import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

const authSecret =
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== "production"
    ? "wave-dev-secret-change-in-production"
    : undefined);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  trustHost: true,

  secret: authSecret,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),

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

        const passwordOk = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!passwordOk) return null;

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
