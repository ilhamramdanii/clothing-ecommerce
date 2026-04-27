import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_session")?.value;

    if (!customerId) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { id, customerId },
      include: {
        address: true,
        items: {
          include: {
            product: { include: { images: { where: { isMain: true }, take: 1 } } },
            variant: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
