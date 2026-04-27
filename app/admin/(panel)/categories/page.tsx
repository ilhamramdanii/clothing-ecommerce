import AdminHeader from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";
import Pagination from "@/components/admin/Pagination";

const PER_PAGE = 10;
type SearchParams = { page?: string };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PER_PAGE;

  const [total, categories] = await Promise.all([
    prisma.category.count(),
    prisma.category.findMany({
      skip,
      take: PER_PAGE,
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <AdminHeader title="Manajemen Kategori" />
      <main className="flex-1 overflow-y-auto p-6">
        <CategoryManager
          initialCategories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c._count.products,
            isActive: c.isActive,
          }))}
          skip={skip}
        />
        <div className="mt-2">
          <Pagination page={page} totalPages={totalPages} basePath="/admin/categories" />
        </div>
      </main>
    </>
  );
}
