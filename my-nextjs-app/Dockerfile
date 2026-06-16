# ── Etapa 1: Dependencias ──────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lock* ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Instalar dependencias
RUN bun install --frozen-lockfile

# ── Etapa 2: Build ────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables necesarias para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://uai_user:uai_password@postgres-db:5432/hotel_boutique?schema=public"
ENV NEXTAUTH_SECRET="392b35bf4468b12f36488bd23dbb9d2f"
ENV NEXTAUTH_URL="http://localhost:3000"

# Generar cliente Prisma y hacer build
RUN bunx prisma generate
RUN bun run build

# ── Etapa 3: Runner ───────────────────────────────────────────────
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root por seguridad
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

# Copiar archivos necesarios para producción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
