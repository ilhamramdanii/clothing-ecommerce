import AdminHeader from "@/components/admin/AdminHeader";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Pagination from "@/components/admin/Pagination";

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Menunggu Bayar", className: "bg-yellow-100 text-yellow-700" },
  PAID:       { label: "Sudah Bayar",    className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Diproses",       className: "bg-indigo-100 text-indigo-700" },
  SHIPPED:    { label: "Dikirim",        className: "bg-purple-100 text-purple-700" },
  DELIVERED:  { label: "Diterima",       className: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Dibatalkan",     className: "bg-red-100 text-red-700" },
};

const PER_PAGE = 10;

type SearchParams = { status?: string; page?: string };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const activeStatus = params.status || "";
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PER_PAGE;

  const where = activeStatus ? { status: activeStatus as never } : undefined;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } } },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const allStatuses = ["Semua", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <>
      <AdminHeader title="Manajemen Pesanan" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {allStatuses.map((s) => (
            <Link
              key={s}
              href={s === "Semua" ? "/admin/orders" : `/admin/orders?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (s === "Semua" && !activeStatus) || s === activeStatus
                  ? "bg-neutral-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {s === "Semua" ? "Semua" : statusMap[s]?.label ?? s}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Belum ada pesanan</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 text-gray-400 font-medium w-10">#</th>
                  <th className="text-left p-4 text-gray-400 font-medium">No. Order</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Customer</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Total</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Tanggal</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const status = statusMap[order.status] ?? { label: order.status, className: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-400">{skip + i + 1}</td>
                      <td className="p-4 font-mono text-xs text-blue-600">{order.orderNumber}</td>
                      <td className="p-4">
                        <p className="font-medium">{order.customer?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{order.customer?.email ?? ""}</p>
                      </td>
                      <td className="p-4 font-medium">{formatRupiah(order.total)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="p-4">
                        <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          <Eye className="h-3 w-3" /> Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="border-t border-gray-100 px-4">
            <div className="flex items-center justify-between py-3">
              <p className="text-xs text-gray-400">
                Menampilkan {skip + 1}–{Math.min(skip + PER_PAGE, total)} dari {total}
              </p>
              <Pagination
                page={page}
                totalPages={totalPages}
                basePath="/admin/orders"
                extraParams={activeStatus ? `status=${activeStatus}` : undefined}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
