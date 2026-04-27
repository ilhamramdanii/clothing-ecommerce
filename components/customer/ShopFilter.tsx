"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  categories: string[];
  activeCategory: string;
  sort: string;
};

export default function ShopFilter({ categories, activeCategory, sort }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "Semua" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Kategori */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Kategori
        </p>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => setParam("category", cat)}
                className={cn(
                  "text-sm w-full text-left py-1 px-2 rounded hover:bg-gray-100 transition-colors",
                  activeCategory === cat
                    ? "font-semibold text-black bg-gray-100"
                    : "text-gray-600"
                )}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Urutkan */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Urutkan
        </p>
        <ul className="space-y-1">
          {[
            { value: "newest", label: "Terbaru" },
            { value: "price-asc", label: "Harga Terendah" },
            { value: "price-desc", label: "Harga Tertinggi" },
          ].map((s) => (
            <li key={s.value}>
              <button
                onClick={() => setParam("sort", s.value)}
                className={cn(
                  "text-sm w-full text-left py-1 px-2 rounded hover:bg-gray-100 transition-colors",
                  sort === s.value
                    ? "font-semibold text-black bg-gray-100"
                    : "text-gray-600"
                )}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
