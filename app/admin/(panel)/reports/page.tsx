import AdminHeader from "@/components/admin/AdminHeader";
import { formatRupiah } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Pagination from "@/components/admin/Pagination";

const PER_PAGE = 10;
type SearchParams = { page?: string };

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PER_PAGE;

  // 6 bulan terakhir
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    months.push({ label: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }), start, end });
  }

  const [monthlySummary, allTopProducts, totalStats] = await Promise.all([
    Promise.all(
      months.map(async (m) => {
        const [orders, customers] = await Promise.all([
          prisma.order.findMany({
            where: { createdAt: { gte: m.start, lte: m.end }, status: { in: ["PAID","PROCESSING","SHIPPED","DELIVERED"] } },
            select: { total: true },
          }),
          prisma.customer.count({ where: { createdAt: { gte: m.start, lte: m.end } } }),
        ]);
        return { month: m.label, orders: orders.length, revenue: orders.reduce((s,o)=>s+o.total,0), customers };
      })
    ),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: { status: { in: ["PAID","PROCESSING","SHIPPED","DELIVERED"] } },
    }),
  ]);

  const totalTopPages = Math.ceil(allTopProducts.length / PER_PAGE);
  const topProducts = allTopProducts.slice(skip, skip + PER_PAGE);

  const productNames = await prisma.product.findMany({
    where: { id: { in: topProducts.map((t) => t.productId) } },
    select: { id: true, name: true, category: { select: { name: true } } },
  });
  const productMap = Object.fromEntries(productNames.map((p) => [p.id, p]));

  const current = monthlySummary[monthlySummary.length - 1];
  const prev = monthlySummary[monthlySummary.length - 2];
  const revenueGrowth = prev.revenue > 0 ? (((current.revenue-prev.revenue)/prev.revenue)*100).toFixed(1) : "0";
  const orderGrowth = prev.orders > 0 ? (((current.orders-prev.orders)/prev.orders)*100).toFixed(1) : "0";

  return (
    <>
      <AdminHeader title="Laporan" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pendapatan Bulan Ini", value: formatRupiah(current.revenue), icon: TrendingUp, note: `${Number(revenueGrowth)>=0?"+":""}${revenueGrowth}% vs bulan lalu`, color: "bg-green-50 text-green-600" },
            { label: "Pesanan Bulan Ini", value: current.orders, icon: ShoppingBag, note: `${Number(orderGrowth)>=0?"+":""}${orderGrowth}% vs bulan lalu`, color: "bg-blue-50 text-blue-600" },
            { label: "Customer Baru", value: current.customers, icon: Users, note: "Bulan ini", color: "bg-purple-50 text-purple-600" },
            { label: "Total Pendapatan", value: formatRupiah(totalStats._sum.total??0), icon: Package, note: `${totalStats._count.id} pesanan`, color: "bg-orange-50 text-orange-600" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <div className={`p-2 rounded-lg ${s.color}`}><Icon className="h-4 w-4" /></div>
                </div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.note}</p>
              </div>
            );
          })}
        </div>

        {/* Monthly */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Ringkasan Bulanan</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-400 font-medium">Bulan</th>
                <th className="text-left py-2 text-gray-400 font-medium">Pesanan</th>
                <th className="text-left py-2 text-gray-400 font-medium">Pendapatan</th>
                <th className="text-left py-2 text-gray-400 font-medium">Customer Baru</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((m) => (
                <tr key={m.month} className="border-b border-gray-50">
                  <td className="py-3 font-medium capitalize">{m.month}</td>
                  <td className="py-3">{m.orders}</td>
                  <td className="py-3 font-medium">{formatRupiah(m.revenue)}</td>
                  <td className="py-3">{m.customers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top products with pagination */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Produk Terlaris</h2>
            <p className="text-xs text-gray-400 mt-0.5">{allTopProducts.length} produk total</p>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada data penjualan</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-gray-400 font-medium w-10">#</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Produk</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Kategori</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Terjual</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((t, i) => {
                    const p = productMap[t.productId];
                    return (
                      <tr key={t.productId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-400">{skip + i + 1}</td>
                        <td className="p-4 font-medium">{p?.name ?? "—"}</td>
                        <td className="p-4 text-gray-500">{p?.category.name ?? "—"}</td>
                        <td className="p-4">{t._sum.quantity ?? 0} pcs</td>
                        <td className="p-4 font-medium">{formatRupiah(t._sum.subtotal ?? 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="border-t border-gray-100 px-4">
                <div className="flex items-center justify-between py-3">
                  <p className="text-xs text-gray-400">
                    Menampilkan {skip + 1}–{Math.min(skip + PER_PAGE, allTopProducts.length)} dari {allTopProducts.length}
                  </p>
                  <Pagination page={page} totalPages={totalTopPages} basePath="/admin/reports" />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
