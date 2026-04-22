import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const EXPERIENCE_TYPES = [
  "RELAX",
  "WELLNESS",
  "GASTRONOMIC",
  "ADVENTURE",
  "ROMANTIC",
  "CULTURAL",
] as const;

type ExperienceType = (typeof EXPERIENCE_TYPES)[number];

function parseCsvList(value: FormDataEntryValue | null) {
  if (!value) return [];
  return value
    .toString()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  async function createHotel(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.id) redirect("/auth/login");

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      redirect("/dashboard");
    }

    const name = formData.get("name")?.toString().trim() ?? "";
    const description = formData.get("description")?.toString().trim() ?? "";
    const location = formData.get("location")?.toString().trim() ?? "";
    const experienceTypeRaw = formData.get("experienceType")?.toString().trim() ?? "";
    const price = Number(formData.get("price"));
    const stars = Number(formData.get("stars"));

    if (!name || !description || !location) {
      throw new Error("Nombre, descripcion y ubicacion son obligatorios.");
    }

    if (!EXPERIENCE_TYPES.includes(experienceTypeRaw as ExperienceType)) {
      throw new Error("Tipo de experiencia invalido.");
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("El precio debe ser mayor a 0.");
    }

    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      throw new Error("Las estrellas deben estar entre 1 y 5.");
    }

    const services = parseCsvList(formData.get("services"));
    const exclusiveFeatures = parseCsvList(formData.get("exclusiveFeatures"));
    const images = parseCsvList(formData.get("images"));

    await prisma.hotel.create({
      data: {
        name,
        description,
        location,
        experienceType: experienceTypeRaw as ExperienceType,
        price,
        stars,
        services,
        exclusiveFeatures,
        images,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/hotels");
  }

  const [usersCount, hotelsCount, reservationsCount, confirmedReservations, latestHotels, latestUsers, latestReservations] =
    await Promise.all([
      prisma.user.count(),
      prisma.hotel.count(),
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "CONFIRMED" } }),
      prisma.hotel.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, name: true, location: true, experienceType: true, price: true, createdAt: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.reservation.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          status: true,
          totalPrice: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          hotel: { select: { name: true } },
        },
      }),
    ]);

  return (
    <div className="min-h-screen relative overflow-hidden text-[#153243]">
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(180,184,171,0.36),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(40,75,99,0.1),_transparent_36%),linear-gradient(180deg,_#eef0eb,_#f4f9e9)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-14 space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#153243]/15 pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#284B63]/75">Admin Area</p>
            <h1 className="font-display mt-2 text-3xl md:text-5xl font-semibold tracking-tight text-[#153243]">
              Panel de administracion
            </h1>
            <p className="mt-2 text-sm text-[#284B63]/85">Gestion de hoteles y datos generales de la plataforma.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#153243]/20 bg-[#EEF0EB] px-3 py-1 text-xs font-semibold text-[#153243]">
              Admin: {user.name ?? "Sin nombre"}
            </span>
            <Link
              href="/dashboard?view=profile"
              className="rounded-full border-2 border-[#153243] bg-[#284B63] px-4 py-2 text-sm font-semibold text-[#F4F9E9] transition hover:bg-[#153243]"
            >
              Ir al dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#284B63]/75">Usuarios</p>
            <p className="mt-2 text-3xl font-black text-[#153243]">{usersCount}</p>
          </article>
          <article className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#284B63]/75">Hoteles</p>
            <p className="mt-2 text-3xl font-black text-[#153243]">{hotelsCount}</p>
          </article>
          <article className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#284B63]/75">Reservas</p>
            <p className="mt-2 text-3xl font-black text-[#153243]">{reservationsCount}</p>
          </article>
          <article className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#284B63]/75">Confirmadas</p>
            <p className="mt-2 text-3xl font-black text-[#153243]">{confirmedReservations}</p>
          </article>
        </section>

        <section className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-6 md:p-7">
          <h2 className="font-display text-2xl font-semibold text-[#153243]">Agregar nuevo hotel</h2>
          <form action={createHotel} className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Nombre</label>
              <input name="name" required className="field w-full rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Descripcion</label>
              <textarea name="description" required rows={4} className="field w-full rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Ubicacion</label>
              <input name="location" required className="field w-full rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Experience type</label>
              <select name="experienceType" required className="field w-full rounded-2xl px-4 py-3 text-sm">
                {EXPERIENCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Precio por noche</label>
              <input name="price" type="number" step="0.01" min="1" required className="field w-full rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Estrellas</label>
              <input name="stars" type="number" min="1" max="5" defaultValue="5" required className="field w-full rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">
                Servicios (separados por coma)
              </label>
              <input name="services" placeholder="Spa, Rooftop, Pool" className="field w-full rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">
                Features exclusivas (separadas por coma)
              </label>
              <input
                name="exclusiveFeatures"
                placeholder="Private terrace, Chef table"
                className="field w-full rounded-2xl px-4 py-3 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">
                Imagenes URL (separadas por coma, opcional)
              </label>
              <input name="images" placeholder="https://..." className="field w-full rounded-2xl px-4 py-3 text-sm" />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full border-2 border-[#153243] bg-[#284B63] px-6 py-2.5 text-sm font-semibold text-[#F4F9E9] transition hover:bg-[#153243]"
              >
                Guardar hotel
              </button>
            </div>
          </form>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <article className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-5">
            <h3 className="font-display text-xl font-semibold text-[#153243]">Ultimos hoteles</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#284B63]/88">
              {latestHotels.map((hotel) => (
                <li key={hotel.id} className="rounded-xl border border-[#153243]/12 bg-[#EEF0EB] px-3 py-2">
                  <p className="font-semibold text-[#153243]">{hotel.name}</p>
                  <p className="text-xs">{hotel.location} · ${hotel.price.toFixed(0)}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-5">
            <h3 className="font-display text-xl font-semibold text-[#153243]">Ultimos usuarios</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#284B63]/88">
              {latestUsers.map((platformUser) => (
                <li key={platformUser.id} className="rounded-xl border border-[#153243]/12 bg-[#EEF0EB] px-3 py-2">
                  <p className="font-semibold text-[#153243]">{platformUser.name ?? "Sin nombre"}</p>
                  <p className="text-xs">{platformUser.email} · {platformUser.role}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel rounded-3xl border border-[#153243]/16 bg-[#F4F9E9]/95 p-5">
            <h3 className="font-display text-xl font-semibold text-[#153243]">Ultimas reservas</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#284B63]/88">
              {latestReservations.map((reservation) => (
                <li key={reservation.id} className="rounded-xl border border-[#153243]/12 bg-[#EEF0EB] px-3 py-2">
                  <p className="font-semibold text-[#153243]">{reservation.hotel.name}</p>
                  <p className="text-xs">{reservation.user.email} · ${reservation.totalPrice} · {reservation.status}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}
