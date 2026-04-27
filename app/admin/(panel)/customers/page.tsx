import AdminHeader from "@/components/admin/AdminHeader";
import { formatRupiah } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import Pagination from "@/components/admin/Pagination";

const PER_PAGE = 10;
type SearchParams = { page?: string };

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PER_PAGE;

  const [total, customers, totalActive, totalRevenue] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.findMany({
      skip,
      take: PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { total: true },
          where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
        },
      },
    }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <AdminHeader title="Manajemen Customer" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Customer", value: total },
            { label: "Customer Aktif", value: totalActive },
            { label: "Total Revenue", value: formatRupiah(totalRevenue._sum.total ?? 0) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-400">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {customers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Belum ada customer terdaftar</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-gray-400 font-medium w-10">#</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Nama</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                    <th className="text-left p-4 text-gray-400 font-medium">No. HP</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Total Order</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Total Belanja</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Bergabung</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => {
                    const spent = c.orders.reduce((s, o) => s + o.total, 0);
                    return (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-400">{skip + i + 1}</td>
                        <td className="p-4 font-medium">{c.name}</td>
                        <td className="p-4 text-gray-500">{c.email}</td>
                        <td className="p-4 text-gray-500">{c.phone ?? "—"}</td>
                        <td className="p-4">{c._count.orders}</td>
                        <td className="p-4 font-medium">{formatRupiah(spent)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {c.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="border-t border-gray-100 px-4">
                <div className="flex items-center justify-between py-3">
                  <p className="text-xs text-gray-400">
                    Menampilkan {skip + 1}–{Math.min(skip + PER_PAGE, total)} dari {total}
                  </p>
                  <Pagination page={page} totalPages={totalPages} basePath="/admin/customers" />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
