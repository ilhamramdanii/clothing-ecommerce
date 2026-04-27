"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

type Variant = {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type Props = {
  product: Product;
  variants: Variant[];
  colors: string[];
  sizes: string[];
};

export default function AddToCartButton({ product, variants, colors, sizes }: Props) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const isSizeAvailable = (size: string) => {
    if (!selectedColor) return variants.some((v) => v.size === size && v.stock > 0);
    return variants.some((v) => v.color === selectedColor && v.size === size && v.stock > 0);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Pilih ukuran dan warna terlebih dahulu");
      return;
    }
    if (selectedVariant.stock === 0) {
      toast.error("Stok habis");
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: product.price,
      quantity: 1,
    });

    toast.success(`${product.name} (${selectedVariant.size} - ${selectedVariant.color}) ditambahkan ke keranjang`);
  };

  return (
    <div className="space-y-6">
      {/* Pilih Warna */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-3">
          Color{selectedColor && <span className="text-black ml-2">— {selectedColor}</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const v = variants.find((v) => v.color === color);
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "w-6 h-6 border-2 transition-all",
                  selectedColor === color ? "border-black scale-110" : "border-transparent hover:border-gray-400"
                )}
                style={{ backgroundColor: v?.colorHex || "#ccc" }}
                title={color}
              />
            );
          })}
        </div>
      </div>

      {/* Pilih Ukuran */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const available = isSizeAvailable(size);
            return (
              <button
                key={size}
                onClick={() => available && setSelectedSize(size)}
                className={cn(
                  "px-3 py-2 text-[11px] tracking-[0.1em] uppercase border transition-all",
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : available
                    ? "border-gray-300 hover:border-black"
                    : "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stok info */}
      {selectedVariant && (
        <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400">
          {selectedVariant.stock > 0
            ? `In Stock — ${selectedVariant.stock} pcs`
            : "Out of Stock"}
        </p>
      )}

      {/* Tombol */}
      <button
        className={cn(
          "w-full py-4 text-[11px] font-medium tracking-[0.2em] uppercase transition-colors",
          !selectedVariant || selectedVariant.stock === 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-900"
        )}
        onClick={handleAddToCart}
        disabled={!selectedVariant || selectedVariant.stock === 0}
      >
        {!selectedColor || !selectedSize
          ? "Select Variant"
          : selectedVariant?.stock === 0
          ? "Out of Stock"
          : "Add to Cart"}
      </button>
    </div>
  );
}
