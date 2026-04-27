import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatRupiah } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import RevenueChart from "@/components/admin/RevenueChart";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Menunggu Bayar", className: "bg-yellow-100 text-yellow-700" },
  PAID:       { label: "Sudah Bayar",    className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Diproses",       className: "bg-indigo-100 text-indigo-700" },
  SHIPPED:    { label: "Dikirim",        className: "bg-purple-100 text-purple-700" },
  DELIVERED:  { label: "Diterima",       className: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Dibatalkan",     className: "bg-red-100 text-red-700" },
};

export default async function DashboardPage() {
  // ── Fetch data dari database ──────────────────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    totalCustomers,
    activeProducts,
    revenueResult,
    orderStatusCounts,
    recentOrders,
    dailyOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.product.count({ where: { isActive: true } }),

    // Total pendapatan dari order yang sudah dibayar
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    }),

    // Hitung per status
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    // 5 pesanan terbaru
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),

    // Pesanan per hari 30 hari terakhir
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true, status: true },
    }),
  ]);

  // ── Proses chart data ─────────────────────────────────────────
  // Buat array 30 hari terakhir
  const chartMap: Record<string, { pendapatan: number; pesanan: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    chartMap[key] = { pendapatan: 0, pesanan: 0 };
  }

  for (const order of dailyOrders) {
    const key = new Date(order.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    if (chartMap[key]) {
      chartMap[key].pesanan += 1;
      if (["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) {
        chartMap[key].pendapatan += order.total;
      }
    }
  }

  // Tampilkan setiap 3 hari agar tidak terlalu padat
  const chartData = Object.entries(chartMap)
    .map(([date, v]) => ({ date, ...v }))
    .filter((_, i) => i % 3 === 0 || i === 29);

  // ── Status counts ─────────────────────────────────────────────
  const countByStatus: Record<string, number> = {};
  for (const row of orderStatusCounts) {
    countByStatus[row.status] = row._count.id;
  }

  const orderStats = [
    { label: "Menunggu Bayar", value: countByStatus["PENDING"] ?? 0,    icon: Clock,         color: "text-yellow-500" },
    { label: "Diproses",       value: countByStatus["PROCESSING"] ?? 0, icon: Package,       color: "text-blue-500" },
    { label: "Dikirim",        value: countByStatus["SHIPPED"] ?? 0,    icon: Truck,         color: "text-purple-500" },
    { label: "Selesai",        value: countByStatus["DELIVERED"] ?? 0,  icon: CheckCircle,   color: "text-green-500" },
    { label: "Dibatalkan",     value: countByStatus["CANCELLED"] ?? 0,  icon: XCircle,       color: "text-red-500" },
  ];

  const totalRevenue = revenueResult._sum.total ?? 0;

  const stats = [
    { label: "Total Pesanan",  value: totalOrders.toString(),    icon: ShoppingBag, change: "Semua waktu",              color: "bg-blue-50 text-blue-600" },
    { label: "Pendapatan",     value: formatRupiah(totalRevenue), icon: TrendingUp,  change: "Pesanan sudah dibayar",    color: "bg-green-50 text-green-600" },
    { label: "Customer",       value: totalCustomers.toString(), icon: Users,       change: "Terdaftar",                color: "bg-purple-50 text-purple-600" },
    { label: "Produk Aktif",   value: activeProducts.toString(), icon: Package,     change: "Sedang dijual",            color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* ── Line Chart ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-700">Pendapatan & Pesanan</h2>
              <p className="text-xs text-gray-400 mt-0.5">30 hari terakhir</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total Periode</p>
              <p className="text-sm font-semibold text-gray-700">
                {formatRupiah(
                  chartData.reduce((acc, d) => acc + d.pendapatan, 0)
                )}
              </p>
            </div>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* ── Order Status ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Status Pesanan</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {orderStats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center">
                  <Icon className={`h-6 w-6 mx-auto mb-1 ${s.color}`} />
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Orders ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Belum ada pesanan</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-400 font-medium w-10">#</th>
                    <th className="text-left py-2 text-gray-400 font-medium">No. Order</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Customer</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Total</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => {
                    const status = statusMap[order.status] ?? { label: order.status, className: "bg-gray-100 text-gray-600" };
                    return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 text-gray-400">{i + 1}</td>
                        <td className="py-3 font-mono text-xs text-blue-600">
                          <a href={`/admin/orders/${order.id}`} className="hover:underline">
                            {order.orderNumber}
                          </a>
                        </td>
                        <td className="py-3 font-medium">{order.customer?.name ?? "—"}</td>
                        <td className="py-3">{formatRupiah(order.total)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  );
}
