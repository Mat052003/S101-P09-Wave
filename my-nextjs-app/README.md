# Wave App (Next.js)

## Setup local

Desde la raíz del repo:

```bash
docker compose up -d
cd my-nextjs-app
cp .env.example .env
npm ci
npm run db:generate
npx prisma db push
npm run db:seed
npm run dev
```

Abrir: http://localhost:3000

## Variables de entorno

Configura al menos estas variables en `.env`:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Validación rápida

```bash
npm run lint
npm run build
```

Notas:

- `npm run build` necesita conexión a internet para descargar Google Fonts.
- Si no usarás Google OAuth, puedes mantener `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` con valores dummy en desarrollo.
