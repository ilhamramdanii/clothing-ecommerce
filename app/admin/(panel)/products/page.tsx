import AdminHeader from "@/components/admin/AdminHeader";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Pagination from "@/components/admin/Pagination";

const PER_PAGE = 10;

type SearchParams = { page?: string };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PER_PAGE;

  const [total, products] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      skip,
      take: PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" }, take: 1 },
        variants: { select: { stock: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <AdminHeader title="Manajemen Produk" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{total} produk terdaftar</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Tambah Produk
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-gray-400 font-medium w-10">#</th>
                <th className="text-left p-4 text-gray-400 font-medium">Produk</th>
                <th className="text-left p-4 text-gray-400 font-medium">Kategori</th>
                <th className="text-left p-4 text-gray-400 font-medium">Harga</th>
                <th className="text-left p-4 text-gray-400 font-medium">Stok</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => {
                const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
                const img = product.images[0]?.url ?? "https://placehold.co/60x75/eee/888?text=?";
                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-400">{skip + i + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded overflow-hidden bg-gray-100 shrink-0">
                          <Image src={img} alt={product.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <span className="font-medium text-gray-800 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">{product.category.name}</td>
                    <td className="p-4 font-medium">{formatRupiah(product.price)}</td>
                    <td className="p-4">
                      <span className={totalStock === 0 ? "text-red-500 font-medium" : totalStock <= 5 ? "text-orange-500 font-medium" : "text-gray-700"}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {product.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/products/${product.id}`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Pencil className="h-3 w-3" /> Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="border-t border-gray-100 px-4">
            <div className="flex items-center justify-between py-3">
              <p className="text-xs text-gray-400">
                Menampilkan {skip + 1}–{Math.min(skip + PER_PAGE, total)} dari {total}
              </p>
              <Pagination page={page} totalPages={totalPages} basePath="/admin/products" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
