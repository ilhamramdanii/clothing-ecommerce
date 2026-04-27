"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { Package, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  product: { name: string };
  variant: { size: string; color: string };
  quantity: number;
};

type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  items: OrderItem[];
};

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Menunggu Pembayaran", className: "bg-yellow-100 text-yellow-700" },
  PAID:       { label: "Dibayar",             className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Diproses",            className: "bg-indigo-100 text-indigo-700" },
  SHIPPED:    { label: "Dikirim",             className: "bg-purple-100 text-purple-700" },
  DELIVERED:  { label: "Selesai",             className: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Dibatalkan",          className: "bg-red-100 text-red-700" },
};

const filterTabs = [
  { key: "all", label: "Semua" },
  { key: "PENDING", label: "Menunggu Bayar" },
  { key: "PROCESSING", label: "Diproses" },
  { key: "SHIPPED", label: "Dikirim" },
  { key: "DELIVERED", label: "Selesai" },
  { key: "CANCELLED", label: "Dibatalkan" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const url = status === "all" ? "/api/customer/orders" : `/api/customer/orders?status=${status}`;
      const res = await fetch(url);
      if (res.status === 401) { router.push("/account/login"); return; }
      if (!res.ok) { toast.error("Gagal memuat pesanan"); return; }
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchOrders(activeTab); }, [activeTab, fetchOrders]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <Package className="h-10 w-10 text-gray-300" />
          <p className="text-gray-400 text-sm">Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = statusMap[order.status];
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-xs text-blue-600">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </div>

                <div className="space-y-1">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm text-gray-600">
                      {item.product.name}{" "}
                      <span className="text-gray-400">({item.variant.size} — {item.variant.color}) x{item.quantity}</span>
                    </p>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                  <p className="text-xs text-gray-400">{order.items.length} produk</p>
                  <p className="font-semibold text-sm">{formatRupiah(order.total)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
