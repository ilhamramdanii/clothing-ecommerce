import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import { prisma } from "@/lib/prisma";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, featuredProduct] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
  ]);

  return (
    <>
      <Navbar
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        featuredImage={featuredProduct?.images[0]?.url}
      />
      {/* pt-14 = 56px to push content below the fixed navbar on all pages.
          Homepage hero overrides this with negative margin (-mt-14). */}
      <main className="flex-1 pt-14">{children}</main>
      <Footer />
    </>
  );
}
