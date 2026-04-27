import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Newsletter */}
        <div className="md:col-span-1">
          <p className="text-sm font-bold tracking-[0.15em] uppercase mb-3">
            Subscribe to the Newsletter
          </p>
          <p className="text-xs text-gray-400 leading-relaxed mb-5">
            Dapatkan akses eksklusif ke koleksi terbaru, preview, dan penawaran spesial.
          </p>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="bg-transparent border border-gray-700 text-white text-xs tracking-wider px-3 py-2 outline-none focus:border-white transition-colors placeholder:text-gray-600"
            />
            <button
              type="submit"
              className="bg-white text-black text-[11px] font-medium tracking-[0.15em] uppercase py-2 hover:bg-gray-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* About */}
        <div>
          <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-500 mb-5">About</p>
          <ul className="space-y-3">
            <li><Link href="/about" className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors uppercase">Our Story</Link></li>
            <li><Link href="/shop" className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors uppercase">Shop</Link></li>
            <li><Link href="/contact" className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors uppercase">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-500 mb-5">Legal Area</p>
          <ul className="space-y-3">
            <li><Link href="/returns" className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors uppercase">Returns &amp; Refunds</Link></li>
            <li><Link href="/privacy" className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors uppercase">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-500 mb-5">Customer Care</p>
          <ul className="space-y-3">
            <li><Link href="/how-to-order" className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors uppercase">How to Order</Link></li>
            <li><Link href="/faq" className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors uppercase">FAQ</Link></li>
            <li><Link href="/contact" className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors uppercase">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-5 text-center">
        <p className="text-[10px] tracking-[0.2em] text-gray-600 uppercase">
          Clothing Store © {new Date().getFullYear()}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
