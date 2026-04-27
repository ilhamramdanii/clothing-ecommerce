import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const sort = searchParams.get("sort");
    const search = searchParams.get("q");

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categorySlug && categorySlug !== "semua" ? { category: { slug: categorySlug } } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      include: {
        category: { select: { name: true, slug: true } },
        images: { where: { isMain: true }, take: 1 },
        variants: { select: { size: true, color: true, stock: true } },
      },
      orderBy: sort === "price-asc"
        ? { price: "asc" }
        : sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil produk" }, { status: 500 });
  }
}
