import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET — ambil semua produk
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("q");

    const products = await prisma.product.findMany({
      where: {
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        isActive: true,
      },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mengambil produk" }, { status: 500 });
  }
}

// POST — tambah produk baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, categoryId, variants, images, isActive } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const slug = slugify(name);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        categoryId,
        isActive: isActive ?? true,
        images: {
          create: images?.map((url: string, i: number) => ({
            url,
            isMain: i === 0,
            order: i,
          })) || [],
        },
        variants: {
          create: variants?.map((v: { size: string; color: string; colorHex?: string; stock: number; price?: number }) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: Number(v.stock),
            price: v.price ? Number(v.price) : null,
          })) || [],
        },
      },
      include: { images: true, variants: true, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membuat produk" }, { status: 500 });
  }
}
