"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { Plus, Minus } from "lucide-react";

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
  description: string;
};

type Props = {
  product: Product;
  variants: Variant[];
};

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-[11px] font-medium tracking-[0.15em] uppercase"
      >
        {title}
        <span className="text-gray-400 text-lg leading-none">
          {open ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </span>
      </button>
      {open && (
        <div className="pb-5 text-xs text-gray-500 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductSidePanel({ product, variants }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  // Get unique sizes
  const sizes = [...new Set(variants.map((v) => v.size))];
  // Get unique colors
  const colors = [...new Set(variants.map((v) => v.color))];

  // Auto-select first color if only 1
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null
  );

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && (selectedColor ? v.color === selectedColor : true)
  );

  const isSizeAvailable = (size: string) => {
    if (selectedColor) {
      return variants.some((v) => v.size === size && v.color === selectedColor && v.stock > 0);
    }
    return variants.some((v) => v.size === size && v.stock > 0);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Pilih ukuran terlebih dahulu");
      return;
    }
    if (!selectedVariant || selectedVariant.stock === 0) {
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
    toast.success(`Ditambahkan ke keranjang`);
  };

  return (
    <div className="space-y-6">
      {/* Color selector (only if multiple colors) */}
      {colors.length > 1 && (
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-3">
            Color — <span className="text-black">{selectedColor ?? ""}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const v = variants.find((vv) => vv.color === color);
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                  className={cn(
                    "w-5 h-5 border-2 transition-all",
                    selectedColor === color ? "border-black" : "border-transparent hover:border-gray-400"
                  )}
                  style={{ backgroundColor: v?.colorHex ?? "#ccc" }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">Size</p>
          <button className="text-[10px] tracking-[0.1em] uppercase text-gray-400 underline underline-offset-2 hover:text-black transition-colors">
            Find My Size
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const available = isSizeAvailable(size);
            return (
              <button
                key={size}
                onClick={() => available && setSelectedSize(size)}
                className={cn(
                  "min-w-[42px] px-2 py-2 text-[11px] tracking-[0.08em] uppercase border transition-all",
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : available
                    ? "border-gray-300 hover:border-black text-gray-700"
                    : "border-gray-100 text-gray-300 cursor-not-allowed"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
        {selectedVariant && (
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 mt-2">
            {selectedVariant.stock > 0 ? `In Stock — ${selectedVariant.stock} pcs` : "Out of Stock"}
          </p>
        )}
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedSize || !selectedVariant || selectedVariant.stock === 0}
        className={cn(
          "w-full py-4 text-[11px] font-medium tracking-[0.25em] uppercase transition-colors",
          !selectedSize || !selectedVariant || selectedVariant.stock === 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-900"
        )}
      >
        {!selectedSize
          ? "Select Size"
          : selectedVariant?.stock === 0
          ? "Out of Stock"
          : "Add to Cart"}
      </button>

      {/* Accordions */}
      <div className="mt-4">
        {product.description && (
          <Accordion title="Description" defaultOpen>
            {product.description}
          </Accordion>
        )}
        <Accordion title="Style & Fit">
          <p>Pilih ukuran yang biasa Anda pakai. Model menggunakan ukuran M.</p>
        </Accordion>
        <Accordion title="Features">
          <ul className="space-y-1">
            <li>— Material premium pilihan</li>
            <li>— Jahitan kuat dan tahan lama</li>
            <li>— Made in Indonesia</li>
          </ul>
        </Accordion>
        <Accordion title="Care">
          <ul className="space-y-1">
            <li>— Cuci tangan dengan air dingin</li>
            <li>— Jangan diperas</li>
            <li>— Keringkan di tempat teduh</li>
          </ul>
        </Accordion>
      </div>
    </div>
  );
}
