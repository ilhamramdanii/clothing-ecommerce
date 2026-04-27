import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — detail order
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        address: true,
        items: { include: { product: { include: { images: true } }, variant: true } },
        payment: true,
      },
    });
    if (!order) return NextResponse.json({ message: "Pesanan tidak ditemukan" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

// PATCH — update status order
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal update status" }, { status: 500 });
  }
}
