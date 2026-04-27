import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const orders = await prisma.order.findMany({
      where: status ? { status: status as never } : {},
      include: {
        customer: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } }, variant: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.order.count({ where: status ? { status: status as never } : {} });

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil pesanan" }, { status: 500 });
  }
}
