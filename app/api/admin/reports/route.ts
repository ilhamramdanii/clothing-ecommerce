import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // format: 2026-04
    const year = searchParams.get("year");

    const now = new Date();
    const startDate = month
      ? new Date(`${month}-01`)
      : new Date(Number(year || now.getFullYear()), 0, 1);
    const endDate = month
      ? new Date(new Date(`${month}-01`).getFullYear(), new Date(`${month}-01`).getMonth() + 1, 0)
      : new Date(Number(year || now.getFullYear()), 11, 31);

    // Total revenue & orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: "PAID",
      },
      include: { items: true },
    });

    const totalRevenue = orders.reduce((sum: number, o: { total: number }) => sum + o.total, 0);
    const totalOrders = orders.length;

    // Top 5 produk
    const orderItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: "PAID" } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const topProducts = await Promise.all(
      orderItems.map(async (item: { productId: string; _sum: { quantity: number | null; subtotal: number | null } }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, category: { select: { name: true } } },
        });
        return {
          productId: item.productId,
          name: product?.name,
          category: product?.category.name,
          sold: item._sum.quantity,
          revenue: item._sum.subtotal,
        };
      })
    );

    return NextResponse.json({ totalRevenue, totalOrders, topProducts, period: { startDate, endDate } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil laporan" }, { status: 500 });
  }
}
