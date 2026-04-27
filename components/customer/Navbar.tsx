"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Menu, Search } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Image from "next/image";

type Category = { name: string; slug: string };
type NavbarProps = {
  categories: Category[];
  featuredImage?: string;
};

export default function Navbar({ categories, featuredImage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems);
  const isHome = pathname === "/";
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShopOpen(true);
  };
  const close = () => {
    timerRef.current = setTimeout(() => setShopOpen(false), 120);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const txt = isHome
    ? "text-white/90 hover:text-white"
    : "text-gray-700 hover:text-black";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-14 ${
        isHome ? "bg-transparent" : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center">

        {/* Left — SHOP (with dropdown) */}
        <div className="flex items-center gap-8 flex-1">
          <div onMouseEnter={open} onMouseLeave={close} className="relative">
            <button className={`text-[11px] font-medium tracking-[0.18em] uppercase transition-colors ${txt}`}>
              SHOP
            </button>

            {shopOpen && (
              <div
                className="fixed left-0 right-0 bg-white border-b border-gray-200 shadow-md"
                style={{ top: 56 }}
                onMouseEnter={open}
                onMouseLeave={close}
              >
                <div className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-3 gap-12">
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-5">
                      Products
                    </p>
                    <ul className="space-y-3">
                      <li>
                        <Link
                          href="/shop"
                          onClick={() => setShopOpen(false)}
                          className="flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase text-gray-800 hover:text-black font-medium"
                        >
                          <span className="text-gray-400 text-xs">&rsaquo;</span> All Products
                        </Link>
                      </li>
                      {categories.map((cat) => (
                        <li key={cat.slug}>
                          <Link
                            href={`/shop?category=${cat.slug}`}
                            onClick={() => setShopOpen(false)}
                            className="flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase text-gray-500 hover:text-black"
                          >
                            <span className="text-gray-300 text-xs">&rsaquo;</span> {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div />
                  {featuredImage && (
                    <div className="relative" style={{ aspectRatio: "4/5" }}>
                      <Image
                        src={featuredImage}
                        alt="Featured"
                        fill
                        className="object-cover bg-[#f0f0ee]"
                        sizes="25vw"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center — Logo */}
        <Link
          href="/"
          className={`absolute left-1/2 -translate-x-1/2 text-xl font-bold tracking-[0.22em] uppercase whitespace-nowrap transition-colors ${
            isHome ? "text-white" : "text-black"
          }`}
        >
          CLOTHING STORE
        </Link>

        {/* Right — SEARCH + CART */}
        <div className="flex items-center gap-8 flex-1 justify-end">
          <Link href="/shop" className={`hidden md:flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase transition-colors ${txt}`}>
            <Search className="h-3 w-3" />SEARCH
          </Link>
          <Link href="/cart" className={`hidden md:block text-[11px] font-medium tracking-[0.18em] uppercase transition-colors ${txt}`}>
            CART{mounted && totalItems() > 0 && ` (${totalItems()})`}
          </Link>

          {/* Mobile */}
          <Link href="/cart" className={`md:hidden text-[11px] font-medium tracking-[0.18em] uppercase ${txt}`}>
            CART{mounted && totalItems() > 0 && ` (${totalItems()})`}
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden ${txt}`} aria-label="menu">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-5 flex flex-col gap-4">
          <Link href="/shop" className="text-[11px] font-medium tracking-[0.18em] uppercase text-gray-700 hover:text-black" onClick={() => setMobileOpen(false)}>All Products</Link>
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="text-[11px] tracking-[0.15em] uppercase text-gray-500 hover:text-black" onClick={() => setMobileOpen(false)}>
              {cat.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex gap-6">
            <Link href="/account/login" className="text-[11px] tracking-[0.15em] uppercase text-gray-500 hover:text-black" onClick={() => setMobileOpen(false)}>Login</Link>
            <Link href="/account/register" className="text-[11px] tracking-[0.15em] uppercase text-gray-500 hover:text-black" onClick={() => setMobileOpen(false)}>Register</Link>
          </div>
        </div>
      )}
    </header>
  );
}
