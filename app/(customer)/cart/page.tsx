"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { formatRupiah } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-100 animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <ShoppingBag className="h-12 w-12 text-gray-300" />
        <h1 className="text-xl font-bold">Keranjang Kosong</h1>
        <p className="text-gray-400 text-sm">Belum ada produk di keranjang kamu</p>
        <Link href="/shop" className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">Mulai Belanja</Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shippingThreshold = 500000;
  const freeShipping = subtotal >= shippingThreshold;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Keranjang ({items.length} item)</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 py-4 border-b border-gray-100">
              <div className="relative w-20 h-24 bg-gray-100 rounded overflow-hidden shrink-0">
                <Image 
                  src={item.productImage} 
                  alt={item.productName} 
                  fill 
                  className="object-cover" 
                  sizes="80px"
                />
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                <p className="text-xs text-gray-400">{item.size} — {item.color}</p>
                <p className="text-sm font-semibold">{formatRupiah(item.price)}</p>

                <div className="flex items-center justify-between pt-2">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-50"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 py-1 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="border border-gray-200 rounded-lg p-5 space-y-4 sticky top-20">
            <h2 className="font-semibold">Ringkasan Pesanan</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className={freeShipping ? "text-green-600 font-medium" : ""}>
                  {freeShipping ? "Gratis" : "Dihitung saat checkout"}
                </span>
              </div>
            </div>

            {!freeShipping && (
              <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
                Belanja <span className="font-medium text-black">{formatRupiah(shippingThreshold - subtotal)}</span> lagi untuk gratis ongkir
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>

            <Link href="/checkout" className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">
              Lanjut ke Checkout
            </Link>

            <Link href="/shop" className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
