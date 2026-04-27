import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_session")?.value;

    if (!customerId) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });

    if (!customer) {
      return NextResponse.json({ message: "Customer tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
