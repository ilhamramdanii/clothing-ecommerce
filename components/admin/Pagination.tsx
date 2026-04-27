import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;          // misal "/admin/products"
  extraParams?: string;      // misal "status=PAID" (tanpa ?)
};

export default function Pagination({ page, totalPages, basePath, extraParams }: Props) {
  if (totalPages <= 1) return null;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams(extraParams ?? "");
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  // Tampilkan max 5 halaman di sekitar halaman aktif
  const delta = 2;
  const range: number[] = [];
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    range.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {/* Prev */}
      {page > 1 ? (
        <Link href={buildUrl(page - 1)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="p-1.5 text-gray-300"><ChevronLeft className="h-4 w-4" /></span>
      )}

      {/* First page */}
      {range[0] > 1 && (
        <>
          <Link href={buildUrl(1)} className="px-3 py-1 text-sm rounded hover:bg-gray-100 text-gray-600 transition-colors">1</Link>
          {range[0] > 2 && <span className="text-gray-300 text-sm px-1">…</span>}
        </>
      )}

      {/* Page range */}
      {range.map((p) => (
        <Link
          key={p}
          href={buildUrl(p)}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            p === page
              ? "bg-neutral-900 text-white font-medium"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          {p}
        </Link>
      ))}

      {/* Last page */}
      {range[range.length - 1] < totalPages && (
        <>
          {range[range.length - 1] < totalPages - 1 && <span className="text-gray-300 text-sm px-1">…</span>}
          <Link href={buildUrl(totalPages)} className="px-3 py-1 text-sm rounded hover:bg-gray-100 text-gray-600 transition-colors">{totalPages}</Link>
        </>
      )}

      {/* Next */}
      {page < totalPages ? (
        <Link href={buildUrl(page + 1)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="p-1.5 text-gray-300"><ChevronRight className="h-4 w-4" /></span>
      )}
    </div>
  );
}
