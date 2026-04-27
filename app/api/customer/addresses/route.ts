import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getCustomerId() {
  const cookieStore = await cookies();
  return cookieStore.get("customer_session")?.value;
}

// GET — daftar alamat customer
export async function GET() {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

// POST — tambah alamat baru
export async function POST(req: NextRequest) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = await req.json();
    const { label, recipientName, phone, address, city, province, postalCode, isDefault } = body;

    if (!label || !recipientName || !phone || !address || !city || !province || !postalCode) {
      return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
    }

    // Jika set sebagai default, hapus default lain
    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: { label, recipientName, phone, address, city, province, postalCode, isDefault: isDefault ?? false, customerId },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
