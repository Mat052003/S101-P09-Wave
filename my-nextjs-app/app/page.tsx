import Image from "next/image";
// 1. IMPORTAMOS LA INSTANCIA YA CREADA (Esta es la única "llave")
import prisma from "../lib/prisma"; 

export default async function Home() {
  // 2. USAMOS ESA INSTANCIA DIRECTAMENTE
  // No necesitamos poner "const prisma = new PrismaClient()" aquí
  const hoteles = await prisma.hotel.findMany();

  return (
    <div className="flex flex-col min-h-screen items-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="flex flex-col w-full max-w-4xl gap-8 bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        
        <div className="flex items-center justify-between">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
            Conexión Activa
          </span>
        </div>

        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Onda: Hoteles Boutique
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-lg">
            Sincronizado con PostgreSQL en Docker
          </p>
        </header>

        <section className="grid gap-6">
          {hoteles.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-zinc-300 rounded-xl text-center">
              <p className="text-zinc-500">No hay hoteles aún. Agrégalos en Prisma Studio.</p>
            </div>
          ) : (
            hoteles.map((hotel) => (
              <div key={hotel.id} className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{hotel.name}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">📍 {hotel.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-green-600 dark:text-green-400">${hotel.price}</span>
                    <p className="text-xs text-zinc-400 uppercase tracking-wider">por noche</p>
                  </div>
                </div>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">{hotel.description}</p>
                <div className="mt-4 flex items-center gap-1">
                  <span className="text-yellow-500">{"★".repeat(hotel.stars)}</span>
                </div>
              </div>
            ))
          )}
        </section>

        <footer className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 text-center italic">Proyecto Ingeniería Civil Industrial - S101-P09</p>
        </footer>
      </main>
    </div>
  );
}