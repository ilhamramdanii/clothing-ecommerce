import { Suspense } from "react";
import Link from "next/link";
import ProductCard from "@/components/customer/ProductCard";
import ShopFilterBar from "@/components/customer/ShopFilterBar";
import { prisma } from "@/lib/prisma";

type SearchParams = { category?: string; sort?: string };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || "";
  const sort = params.sort || "newest";

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const activeCat = categories.find((c) => c.slug === activeCategory) ?? null;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(activeCategory && { category: { slug: activeCategory } }),
    },
    include: {
      category: true,
      images: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy:
      sort === "price-asc" ? { price: "asc" }
      : sort === "price-desc" ? { price: "desc" }
      : { createdAt: "desc" },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-5">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>&rsaquo;</span>
        <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
        {activeCat && (
          <>
            <span>&rsaquo;</span>
            <span className="text-black">{activeCat.name}</span>
          </>
        )}
      </nav>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-[0.12em] uppercase mb-6">
        {activeCat?.name ?? "All Products"}
      </h1>

      {/* Filter bar */}
      <div className="flex items-center justify-between border-y border-gray-200 py-3 mb-8">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">
          {products.length} Products
        </p>
        <Suspense fallback={null}>
          <ShopFilterBar
            categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
            activeCategory={activeCategory}
            sort={sort}
          />
        </Suspense>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400">
            No products found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {products.map((product) => (
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
      )}
    </div>
  );
}
