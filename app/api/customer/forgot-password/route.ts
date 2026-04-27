import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ message: "Email dan password baru wajib diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { email } });

    if (!customer || !customer.isActive) {
      // Kembalikan pesan sama agar tidak bocorkan info akun
      return NextResponse.json({ message: "Jika email terdaftar, password berhasil diubah" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({
      where: { email },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Jika email terdaftar, password berhasil diubah" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
