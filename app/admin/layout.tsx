// Root admin layout — hanya membungkus tanpa sidebar.
// Halaman login berada di sini tanpa sidebar.
// Halaman dashboard/products/dll ada di (panel)/layout.tsx yang punya sidebar.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
