"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  categories: { name: string; slug: string }[];
  activeCategory: string;
  sort: string;
};

export default function ShopFilterBar({ categories, activeCategory, sort }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center gap-6">
      {/* Sort */}
      <div className="flex items-center gap-3">
        {[
          { value: "newest", label: "Terbaru" },
          { value: "price-asc", label: "Harga ↑" },
          { value: "price-desc", label: "Harga ↓" },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setParam("sort", s.value === "newest" ? "" : s.value)}
            className={cn(
              "text-[10px] tracking-[0.15em] uppercase transition-colors",
              sort === s.value ? "text-black font-medium" : "text-gray-400 hover:text-black"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="text-[10px] font-medium tracking-[0.2em] uppercase text-gray-700 hover:text-black flex items-center gap-1 transition-colors"
      >
        Filters {open ? "−" : "+"}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-8 z-30 bg-white border border-gray-200 shadow-sm min-w-[180px]">
          <div className="p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-3">Kategori</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setParam("category", "")}
                  className={cn(
                    "text-[11px] tracking-[0.1em] uppercase w-full text-left transition-colors",
                    !activeCategory ? "font-medium text-black" : "text-gray-500 hover:text-black"
                  )}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => setParam("category", cat.slug)}
                    className={cn(
                      "text-[11px] tracking-[0.1em] uppercase w-full text-left transition-colors",
                      activeCategory === cat.slug ? "font-medium text-black" : "text-gray-500 hover:text-black"
                    )}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
