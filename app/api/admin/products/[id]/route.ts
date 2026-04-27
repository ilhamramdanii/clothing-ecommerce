import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET — detail produk
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, category: true },
    });
    if (!product) return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

// PUT — update produk
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, price, categoryId, isActive } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: name ? slugify(name) : undefined,
        description,
        price: price ? Number(price) : undefined,
        categoryId,
        isActive,
      },
      include: { images: true, variants: true, category: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal update produk" }, { status: 500 });
  }
}

// DELETE — hapus produk
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Produk dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal menghapus produk" }, { status: 500 });
  }
}
