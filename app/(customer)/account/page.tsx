"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingBag, MapPin, User, LogOut, ChevronRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
};

type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  items: { id: string }[];
};

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Menunggu Bayar", className: "bg-yellow-100 text-yellow-700" },
  PAID:       { label: "Dibayar",        className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Diproses",       className: "bg-indigo-100 text-indigo-700" },
  SHIPPED:    { label: "Dikirim",        className: "bg-purple-100 text-purple-700" },
  DELIVERED:  { label: "Selesai",        className: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Dibatalkan",     className: "bg-red-100 text-red-700" },
};

const menuItems = [
  { href: "/orders", label: "Pesanan Saya", icon: ShoppingBag, desc: "Lihat semua riwayat pesanan" },
  { href: "/account/addresses", label: "Alamat Saya", icon: MapPin, desc: "Kelola alamat pengiriman" },
  { href: "/account/profile", label: "Edit Profil", icon: User, desc: "Ubah data diri dan password" },
];

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/customer/me").then((r) => {
        if (r.status === 401) { router.push("/account/login"); return null; }
        return r.json();
      }),
      fetch("/api/customer/orders").then((r) => r.ok ? r.json() : []),
    ])
      .then(([customerData, ordersData]) => {
        if (customerData) setCustomer(customerData);
        setOrders((ordersData as Order[]).slice(0, 3));
      })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/customer/logout", { method: "POST" });
    toast.success("Logout berhasil");
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
        <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">

      {/* Profil Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xl font-bold shrink-0">
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg">{customer.name}</p>
          <p className="text-sm text-gray-400">{customer.email}</p>
          <p className="text-xs text-gray-300 mt-0.5">Member sejak {formatJoinDate(customer.createdAt)}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${i < menuItems.length - 1 ? "border-b border-gray-50" : ""}`}
            >
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </Link>
          );
        })}
      </div>

      {/* Pesanan Terbaru */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Pesanan Terbaru</h2>
          <Link href="/orders" className="text-xs text-blue-600 hover:underline">Lihat semua</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Belum ada pesanan</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => {
              const status = statusMap[order.status];
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:opacity-70 transition-opacity"
                >
                  <div>
                    <p className="font-mono text-xs text-blue-600">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatOrderDate(order.createdAt)} · {order.items.length} produk</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <p className="text-xs font-semibold">{formatRupiah(order.total)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-xl border border-gray-100 text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="text-sm font-medium">Keluar dari Akun</span>
      </button>

    </div>
  );
}
