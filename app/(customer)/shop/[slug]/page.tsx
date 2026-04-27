import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import ProductSidePanel from "@/components/customer/ProductSidePanel";
import { prisma } from "@/lib/prisma";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });

  if (!product) notFound();

  const images =
    product.images.length > 0
      ? product.images.map((i) => i.url)
      : ["https://placehold.co/600x750/f0f0ee/888?text=No+Image"];

  return (
    /*
      Layout: left column (images) takes remaining width,
      right column (info) is fixed 380px and sticky.
      Both live in a flex row that fills at least the viewport height.
    */
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-56px)]">

      {/* ── LEFT: Image grid ──────────────────────────────────── */}
      <div className="flex-1">
        {/* 2-column grid; images fill naturally with consistent 3:4 ratio */}
        <div className="grid grid-cols-2 gap-px bg-gray-200">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative bg-[#eeecea] overflow-hidden"
              style={{ paddingBottom: "133.33%" /* = 4/3 * 100% */ }}
            >
              <Image
                src={img}
                alt={`${product.name} ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(max-width: 768px) 50vw, 35vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Sticky info panel ──────────────────────────── */}
      <div className="md:w-[380px] shrink-0 border-t md:border-t-0 md:border-l border-gray-200">
        <div className="md:sticky md:top-14 md:max-h-[calc(100vh-56px)] md:overflow-y-auto">
          <div className="px-6 py-7">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-5">
              <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
              <span>/</span>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-black transition-colors">
                {product.category.name}
              </Link>
            </nav>

            {/* Name */}
            <h1 className="text-[13px] font-bold tracking-[0.1em] uppercase leading-snug mb-2">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-[13px] tracking-wider font-medium mb-7">
              {formatRupiah(product.price)}
            </p>

            {/* Size + Cart + Accordions (client component) */}
            <ProductSidePanel
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: images[0],
                description: product.description ?? "",
              }}
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                colorHex: v.colorHex ?? "#888",
                stock: v.stock,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
