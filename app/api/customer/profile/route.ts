import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

async function getCustomerId() {
  const cookieStore = await cookies();
  return cookieStore.get("customer_session")?.value;
}

// GET — ambil profil customer
export async function GET() {
  try {
    const customerId = await getCustomerId();
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

// PUT — update profil customer
export async function PUT(req: NextRequest) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, currentPassword, newPassword } = body;

    if (!name) {
      return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
    }

    const updateData: { name: string; phone?: string | null; password?: string } = { name, phone };

    // Jika ingin ganti password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: "Password lama wajib diisi untuk mengganti password" }, { status: 400 });
      }

      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return NextResponse.json({ message: "Customer tidak ditemukan" }, { status: 404 });
      }

      const valid = await bcrypt.compare(currentPassword, customer.password);
      if (!valid) {
        return NextResponse.json({ message: "Password lama tidak sesuai" }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
