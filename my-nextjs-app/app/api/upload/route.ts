// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }

    // Validar tipo
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Solo JPG, PNG o WEBP" }, { status: 400 });
    }

    // Validar tamaño (5MB máx)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Archivo muy grande (máx 5MB)" }, { status: 400 });
    }

    // Generar nombre único
    const ext = file.name.split(".").pop();
    const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;

    // Guardar en /public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
