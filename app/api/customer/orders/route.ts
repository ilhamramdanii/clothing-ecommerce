import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_session")?.value;

    if (!customerId) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: {
        customerId,
        ...(status ? { status: status as "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" } : {}),
      },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
            variant: { select: { size: true, color: true } },
          },
        },
        payment: { select: { snapToken: true, snapUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
