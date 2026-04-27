"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ArrowLeft, MapPin, Truck, CreditCard, CheckCircle, Clock, Package, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type OrderDetail = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingCourier: string | null;
  shippingService: string | null;
  address: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      images: { url: string }[];
    };
    variant: { size: string; color: string };
  }[];
  payment: {
    snapToken: string | null;
    snapUrl: string | null;
    method: string | null;
    paidAt: string | null;
  } | null;
};

const statusSteps = [
  { key: "PENDING",    label: "Menunggu Pembayaran", icon: Clock },
  { key: "PAID",       label: "Pembayaran Diterima",  icon: CreditCard },
  { key: "PROCESSING", label: "Pesanan Diproses",     icon: Package },
  { key: "SHIPPED",    label: "Dalam Pengiriman",     icon: Truck },
  { key: "DELIVERED",  label: "Pesanan Diterima",     icon: CheckCircle },
];

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Menunggu Pembayaran", className: "bg-yellow-100 text-yellow-700" },
  PAID:       { label: "Dibayar",             className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Diproses",            className: "bg-indigo-100 text-indigo-700" },
  SHIPPED:    { label: "Dikirim",             className: "bg-purple-100 text-purple-700" },
  DELIVERED:  { label: "Selesai",             className: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Dibatalkan",          className: "bg-red-100 text-red-700" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customer/orders/${orderId}`)
      .then((r) => {
        if (r.status === 401) { router.push("/account/login"); return null; }
        if (r.status === 404) { router.push("/orders"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setOrder(data); })
      .catch(() => toast.error("Gagal memuat pesanan"))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!order) return null;

  const status = statusMap[order.status];
  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-5">

      {/* Back */}
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Pesanan
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-blue-600 font-semibold">{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Progress Tracker */}
      {order.status !== "CANCELLED" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-sm mb-5">Status Pesanan</h2>
          <div className="flex items-start">
            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStepIndex;
              const active = i === currentStepIndex;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {i < statusSteps.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < currentStepIndex ? "bg-black" : "bg-gray-200"}`} />
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mb-2 ${active ? "bg-black text-white" : done ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <p className={`text-center text-[10px] leading-tight ${active ? "font-semibold text-black" : done ? "text-gray-500" : "text-gray-300"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.status === "CANCELLED" && (
        <div className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">Pesanan Dibatalkan</p>
            <p className="text-xs text-red-500 mt-0.5">Pesanan ini telah dibatalkan</p>
          </div>
        </div>
      )}

      {/* Item Pesanan */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-sm mb-4">Item Pesanan</h2>
        {order.items.map((item) => {
          const image = item.product.images[0]?.url;
          return (
            <div key={item.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
              <div className="relative w-14 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                {image ? (
                  <img src={image} alt={item.product.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.variant.size} — {item.variant.color}</p>
                <p className="text-xs text-gray-500 mt-1">{item.quantity}x {formatRupiah(item.price)}</p>
              </div>
              <p className="text-sm font-semibold">{formatRupiah(item.price * item.quantity)}</p>
            </div>
          );
        })}

        {/* Total */}
        <div className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Ongkos Kirim</span>
            <span>{order.shippingCost === 0 ? "Gratis" : formatRupiah(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 mt-2">
            <span>Total</span><span>{formatRupiah(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Alamat & Pengiriman */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm">Alamat Pengiriman</h2>
          </div>
          <div className="text-sm space-y-0.5 text-gray-600">
            <p className="font-medium text-gray-800">{order.address.recipientName}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.address}</p>
            <p>{order.address.city}, {order.address.province} {order.address.postalCode}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm">Info Pengiriman</h2>
          </div>
          <div className="text-sm space-y-0.5 text-gray-600">
            {order.shippingCourier ? (
              <p className="font-medium text-gray-800">{order.shippingCourier} {order.shippingService}</p>
            ) : (
              <p className="text-gray-400">-</p>
            )}
            {order.payment?.paidAt && (
              <p className="text-gray-400 text-xs mt-2">Dibayar: {formatDateTime(order.payment.paidAt)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bayar Sekarang jika PENDING */}
      {order.status === "PENDING" && order.payment?.snapUrl && (
        <div className="bg-yellow-50 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-yellow-800">Segera selesaikan pembayaran</p>
            <p className="text-xs text-yellow-600 mt-0.5">Pesanan akan otomatis dibatalkan jika tidak dibayar</p>
          </div>
          <a href={order.payment.snapUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="shrink-0 bg-yellow-500 hover:bg-yellow-600 text-white border-0">
              Bayar Sekarang
            </Button>
          </a>
        </div>
      )}

    </div>
  );
}
