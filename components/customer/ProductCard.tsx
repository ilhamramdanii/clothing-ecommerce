"use client";

import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      {/* Image container — uses padding-bottom trick for consistent 3:4 ratio */}
      <div
        className="relative bg-[#eeece9] overflow-hidden mb-3"
        style={{ paddingBottom: "133.33%" }}
      >
        {product.isNew && (
          <span className="absolute top-2 left-2 z-10 bg-black text-white text-[9px] font-medium tracking-[0.15em] uppercase px-2 py-1">
            NEW
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      {/* Info */}
      <p className="text-[11px] font-medium tracking-[0.08em] uppercase leading-snug mb-1">
        {product.name}
      </p>
      <p className="text-[11px] tracking-wider text-gray-600">
        {formatRupiah(product.price)}
      </p>
    </Link>
  );
}
