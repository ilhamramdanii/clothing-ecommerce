import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Nama, email, dan password wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: { name, email, phone, password: hashed },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ message: "Akun berhasil dibuat", customer }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
