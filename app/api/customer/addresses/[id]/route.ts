import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getCustomerId() {
  const cookieStore = await cookies();
  return cookieStore.get("customer_session")?.value;
}

// PUT — update alamat
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { label, recipientName, phone, address, city, province, postalCode, isDefault } = body;

    // Pastikan alamat milik customer ini
    const existing = await prisma.address.findFirst({ where: { id, customerId } });
    if (!existing) {
      return NextResponse.json({ message: "Alamat tidak ditemukan" }, { status: 404 });
    }

    // Jika set sebagai default, hapus default lain
    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: { label, recipientName, phone, address, city, province, postalCode, isDefault: isDefault ?? existing.isDefault },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

// DELETE — hapus alamat
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.address.findFirst({ where: { id, customerId } });
    if (!existing) {
      return NextResponse.json({ message: "Alamat tidak ditemukan" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ message: "Alamat dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
