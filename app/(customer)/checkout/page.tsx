"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronRight, MapPin, Truck, ShoppingBag } from "lucide-react";

type Step = "address" | "shipping" | "payment";

const COURIERS = [
  { id: "jne-reg", name: "JNE", service: "REG", estimate: "2-3 hari", price: 15000 },
  { id: "jne-yes", name: "JNE", service: "YES", estimate: "1 hari", price: 35000 },
  { id: "jnt-ez", name: "J&T", service: "EZ", estimate: "2-3 hari", price: 12000 },
  { id: "sicepat-reg", name: "SiCepat", service: "BEST", estimate: "2-3 hari", price: 11000 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("address");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [address, setAddress] = useState({
    label: "Rumah",
    recipientName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const subtotal = totalPrice();
  const courier = COURIERS.find((c) => c.id === selectedCourier);
  const shippingCost = subtotal >= 500000 ? 0 : (courier?.price || 0);
  const total = subtotal + shippingCost;

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-100 animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  const handleAddressNext = () => {
    const { recipientName, phone, address: addr, city, province, postalCode } = address;
    if (!recipientName || !phone || !addr || !city || !province || !postalCode) {
      toast.error("Lengkapi semua field alamat");
      return;
    }
    setStep("shipping");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShippingNext = () => {
    if (!selectedCourier && subtotal < 500000) {
      toast.error("Pilih kurir pengiriman");
      return;
    }
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrder = async () => {
    setLoading(true);
    try {
      // Simulasi — nanti hit API /api/orders
      await new Promise((r) => setTimeout(r, 1500));

      // Load Midtrans Snap
      const snapToken = "dummy-snap-token"; // dari API response

      // Untuk production: window.snap.pay(snapToken, {...})
      toast.success("Pesanan dibuat! Redirecting ke pembayaran...");
      clearCart();
      router.push("/orders/ORD-20260405-0001");
    } catch {
      toast.error("Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <ShoppingBag className="h-12 w-12 text-gray-300" />
        <h1 className="text-xl font-bold">Keranjang Kosong</h1>
        <p className="text-gray-400 text-sm">Tidak ada produk untuk dicheckout</p>
        <Button onClick={() => router.push("/shop")}>Mulai Belanja</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {(["address", "shipping", "payment"] as Step[]).map((s, i) => {
          const labels = ["Alamat", "Pengiriman", "Pembayaran"];
          const passed = ["address", "shipping", "payment"].indexOf(step) > i;
          const active = step === s;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${active ? "text-black font-semibold" : passed ? "text-gray-400" : "text-gray-300"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${active ? "bg-black text-white border-black" : passed ? "bg-gray-200 border-gray-200 text-gray-500" : "border-gray-200 text-gray-300"}`}>
                  {i + 1}
                </span>
                {labels[i]}
              </div>
              {i < 2 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Kiri — Form */}
        <div className="flex-1 space-y-5">

          {/* Step 1 — Alamat */}
          {step === "address" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                <h2 className="font-semibold">Alamat Pengiriman</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Nama Penerima</Label>
                  <Input placeholder="Nama lengkap" value={address.recipientName} onChange={(e) => setAddress({ ...address, recipientName: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>No. Telepon</Label>
                  <Input placeholder="08xxxxxxxxxx" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Alamat Lengkap</Label>
                  <textarea
                    rows={3}
                    placeholder="Jl. Nama Jalan No. XX, RT/RW, Kelurahan, Kecamatan"
                    value={address.address}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kota</Label>
                  <Input placeholder="Jakarta Selatan" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Provinsi</Label>
                  <Input placeholder="DKI Jakarta" value={address.province} onChange={(e) => setAddress({ ...address, province: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Kode Pos</Label>
                  <Input placeholder="12345" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Label Alamat</Label>
                  <select
                    value={address.label}
                    onChange={(e) => setAddress({ ...address, label: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm"
                  >
                    <option>Rumah</option>
                    <option>Kantor</option>
                    <option>Lainnya</option>
                  </select>
                </div>
              </div>

              <Button className="w-full mt-2" onClick={handleAddressNext}>
                Lanjut ke Pengiriman
              </Button>
            </div>
          )}

          {/* Step 2 — Kurir */}
          {step === "shipping" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4" />
                <h2 className="font-semibold">Pilih Kurir Pengiriman</h2>
              </div>

              {subtotal >= 500000 && (
                <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">
                  Selamat! Kamu mendapatkan <strong>gratis ongkir</strong> karena belanja di atas Rp 500.000
                </div>
              )}

              <div className="space-y-2">
                {COURIERS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourier(c.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors text-left ${selectedCourier === c.id ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{c.name} <span className="text-gray-400">{c.service}</span></p>
                      <p className="text-xs text-gray-400 mt-0.5">Estimasi {c.estimate}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {subtotal >= 500000 ? <span className="text-green-600">Gratis</span> : formatRupiah(c.price)}
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Catatan untuk penjual (opsional)</Label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Tolong dibungkus rapi"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep("address")}>Kembali</Button>
                <Button className="flex-1" onClick={handleShippingNext}>Lanjut ke Pembayaran</Button>
              </div>
            </div>
          )}

          {/* Step 3 — Konfirmasi */}
          {step === "payment" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-semibold">Konfirmasi Pesanan</h2>

              {/* Ringkasan Alamat */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <p className="font-medium text-xs text-gray-400 uppercase tracking-wider mb-2">Alamat Pengiriman</p>
                <p className="font-medium">{address.recipientName}</p>
                <p className="text-gray-500">{address.phone}</p>
                <p className="text-gray-500">{address.address}</p>
                <p className="text-gray-500">{address.city}, {address.province} {address.postalCode}</p>
              </div>

              {/* Ringkasan Kurir */}
              {courier && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p className="font-medium text-xs text-gray-400 uppercase tracking-wider mb-2">Pengiriman</p>
                  <p className="font-medium">{courier.name} {courier.service} — Estimasi {courier.estimate}</p>
                  <p className="text-gray-500">{subtotal >= 500000 ? "Gratis Ongkir" : formatRupiah(courier.price)}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("shipping")}>Kembali</Button>
                <Button className="flex-1" onClick={handleOrder} disabled={loading}>
                  {loading ? "Memproses..." : "Bayar Sekarang"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Kanan — Ringkasan Order */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 sticky top-20">
            <h2 className="font-semibold">Ringkasan Pesanan</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative w-12 h-14 bg-gray-100 rounded overflow-hidden shrink-0">
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.size} — {item.color}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.quantity}x {formatRupiah(item.price)}</p>
                  </div>
                  <p className="text-xs font-semibold shrink-0">{formatRupiah(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Ongkos Kirim</span>
                <span className={shippingCost === 0 && courier ? "text-green-600 font-medium" : ""}>
                  {subtotal >= 500000 ? "Gratis" : courier ? formatRupiah(shippingCost) : "-"}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
