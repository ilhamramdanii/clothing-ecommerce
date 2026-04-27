import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/customer/ProductCard";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        category: true,
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
        products: {
          take: 1,
          where: { isActive: true },
          include: { images: { orderBy: { order: "asc" }, take: 1 } },
        },
      },
    }),
  ]);

  const heroImage =
    featuredProducts[0]?.images[0]?.url ??
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1400&q=80";

  return (
    <div>
      {/* ── HERO — pull up behind the fixed navbar ─────────────── */}
      {/* -mt-14 negates the pt-14 from layout so hero starts at top:0 */}
      <section className="relative -mt-14 bg-black" style={{ height: "100vh" }}>
        <Image
          src={heroImage}
          alt="New Collection"
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 text-center text-white pb-16 px-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-[0.08em] uppercase mb-3">
            New Season
          </h1>
          <p className="text-[11px] tracking-[0.4em] uppercase text-gray-300 mb-6">
            An Exploration of Form, Colours, and Craft
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.3em] uppercase text-white border-b border-white pb-0.5 hover:text-gray-300 hover:border-gray-300 transition-colors"
          >
            Discover More &nbsp;&rsaquo;
          </Link>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-8">
            Featured Products
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image:
                    product.images[0]?.url ??
                    "https://placehold.co/400x500/f0f0ee/888?text=No+Image",
                  category: product.category.name,
                  isNew: false,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORIES ────────────────────────────────── */}
      <section className="pb-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-8">
            Shop by Categories
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200">
            {categories.slice(0, 4).map((cat) => {
              const img =
                cat.products[0]?.images[0]?.url ??
                `https://placehold.co/400x500/111/fff?text=${encodeURIComponent(cat.name)}`;
              return (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative bg-black overflow-hidden"
                  style={{ aspectRatio: "3/4" }}
                >
                  <Image
                    src={img}
                    alt={cat.name}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-50 group-hover:scale-[1.03] transition-all duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-white text-[11px] font-medium tracking-[0.2em] uppercase">
                      {cat.name} &rsaquo;
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INFO ─────────────────────────────────────────────── */}
      <section className="border-t border-gray-200 py-14">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: "Free Shipping", body: "Gratis ongkir ke seluruh Indonesia untuk pembelian di atas Rp 500.000." },
            { title: "Quality Materials", body: "Setiap produk dibuat dari material pilihan dengan standar kualitas tinggi." },
            { title: "Made in Indonesia", body: "Produksi lokal dengan pengerjaan tangan yang teliti dan penuh perhatian." },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-3">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
