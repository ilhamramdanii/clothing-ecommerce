import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { email } });

    if (!customer || !customer.isActive) {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("customer_session", customer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return NextResponse.json({
      message: "Login berhasil",
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
