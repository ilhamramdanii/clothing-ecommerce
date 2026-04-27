import AdminHeader from "@/components/admin/AdminHeader";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Menunggu Bayar", className: "bg-yellow-100 text-yellow-700" },
  PAID:       { label: "Sudah Bayar",    className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Diproses",       className: "bg-indigo-100 text-indigo-700" },
  SHIPPED:    { label: "Dikirim",        className: "bg-purple-100 text-purple-700" },
  DELIVERED:  { label: "Diterima",       className: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Dibatalkan",     className: "bg-red-100 text-red-700" },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      address: true,
      items: {
        include: {
          product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
          variant: true,
        },
      },
      payment: true,
    },
  });

  if (!order) notFound();

  const status = statusMap[order.status] ?? { label: order.status, className: "bg-gray-100 text-gray-600" };

  return (
    <>
      <AdminHeader title={`Pesanan ${order.orderNumber}`} />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Items + Payment */}
          <div className="lg:col-span-2 space-y-5">

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-700 mb-4">Item Pesanan</h2>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const img = item.product.images[0]?.url ?? "https://placehold.co/60x75/eee/888?text=?";
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                        <Image src={img} alt={item.product.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-400">{item.variant.size} · {item.variant.color}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatRupiah(item.subtotal)}</p>
                        <p className="text-xs text-gray-400">{item.quantity}x {formatRupiah(item.price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Ongkir {order.shippingCourier} {order.shippingService}</span>
                  <span>{formatRupiah(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1 border-t border-gray-100">
                  <span>Total</span><span>{formatRupiah(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            {order.payment && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-700 mb-3">Pembayaran</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-4"><dt className="text-gray-400 w-32">Status</dt><dd className="font-medium">{order.payment.status}</dd></div>
                  <div className="flex gap-4"><dt className="text-gray-400 w-32">Metode</dt><dd>{order.payment.method ?? "—"}</dd></div>
                  {order.payment.paidAt && (
                    <div className="flex gap-4"><dt className="text-gray-400 w-32">Dibayar</dt>
                      <dd>{new Date(order.payment.paidAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Right: Status + Customer + Address */}
          <div className="space-y-5">
            {/* Status updater */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-700 mb-3">Status Pesanan</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
              <div className="mt-4">
                <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
              </div>
            </div>

            {/* Customer */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-700 mb-3">Customer</h2>
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2"><dt className="text-gray-400">Nama</dt><dd className="font-medium">{order.customer.name}</dd></div>
                <div className="flex gap-2"><dt className="text-gray-400">Email</dt><dd>{order.customer.email}</dd></div>
                {order.customer.phone && <div className="flex gap-2"><dt className="text-gray-400">HP</dt><dd>{order.customer.phone}</dd></div>}
              </dl>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-700 mb-3">Alamat Pengiriman</h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.address.recipientName}</p>
                <p className="text-gray-500">{order.address.phone}</p>
                <p className="text-gray-500">{order.address.address}</p>
                <p className="text-gray-500">{order.address.city}, {order.address.province} {order.address.postalCode}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
