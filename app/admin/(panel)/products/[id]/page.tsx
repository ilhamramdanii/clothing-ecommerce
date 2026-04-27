"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";

type Variant = { id: string; size: string; color: string; colorHex: string; stock: number; price: string };
type Category = { id: string; name: string };

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isEdit = id !== "new";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isActive: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState({ size: "M", color: "", colorHex: "#000000", stock: "0", price: "" });
  const [images, setImages] = useState<string[]>([]); // array of URLs
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Ambil kategori
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => toast.error("Gagal memuat kategori"));
  }, []);

  // Jika edit, ambil data produk
  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/admin/products/${id}`)
      .then((r) => {
        if (!r.ok) { toast.error("Produk tidak ditemukan"); router.push("/admin/products"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setForm({
          name: data.name,
          description: data.description ?? "",
          price: String(data.price),
          categoryId: data.categoryId,
          isActive: data.isActive,
        });
        setVariants(data.variants.map((v: { id: string; size: string; color: string; colorHex?: string; stock: number; price?: number }) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex ?? "#000000",
          stock: v.stock,
          price: v.price ? String(v.price) : "",
        })));
        setImages(data.images.map((img: { url: string }) => img.url));
      })
      .catch(() => toast.error("Gagal memuat produk"))
      .finally(() => setFetching(false));
  }, [id, isEdit, router]);

  const addVariant = () => {
    if (!newVariant.color) { toast.error("Isi nama warna"); return; }
    setVariants([...variants, { ...newVariant, id: Date.now().toString(), stock: Number(newVariant.stock) }]);
    setNewVariant({ size: "M", color: "", colorHex: "#000000", stock: "0", price: "" });
  };

  const removeVariant = (variantId: string) => setVariants(variants.filter((v) => v.id !== variantId));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Gagal mengupload gambar"); return; }
      setImages((prev) => [...prev, data.url]);
    } catch {
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) { toast.error("Lengkapi data produk"); return; }
    if (variants.length === 0) { toast.error("Tambahkan minimal 1 varian"); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId,
        isActive: form.isActive,
        images,
        variants: variants.map((v) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: Number(v.stock),
          price: v.price ? Number(v.price) : undefined,
        })),
      };

      const url = isEdit ? `/api/admin/products/${id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Gagal menyimpan produk"); return; }

      toast.success(isEdit ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
      router.push("/admin/products");
    } catch {
      toast.error("Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <AdminHeader title="Edit Produk" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={isEdit ? "Edit Produk" : "Tambah Produk"} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Back */}
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Form Utama */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-700">Informasi Produk</h2>

              <div className="space-y-1.5">
                <Label>Nama Produk</Label>
                <Input placeholder="Military Jacket Dark Olive" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <textarea
                  rows={4}
                  placeholder="Deskripsi produk..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Harga Dasar (Rp)</Label>
                  <Input type="number" placeholder="350000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Pilih kategori...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Varian */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-700">Varian Produk (Ukuran & Warna)</h2>

              {/* Tambah Varian */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Ukuran</Label>
                  <select
                    value={newVariant.size}
                    onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                    className="w-full border border-input rounded-lg px-2 py-1.5 text-sm"
                  >
                    {sizes.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nama Warna</Label>
                  <Input placeholder="Dark Olive" value={newVariant.color} onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kode Warna</Label>
                  <input type="color" value={newVariant.colorHex} onChange={(e) => setNewVariant({ ...newVariant, colorHex: e.target.value })} className="w-full h-8 border border-input rounded-lg cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Stok</Label>
                  <Input type="number" placeholder="0" value={newVariant.stock} onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })} className="h-8 text-sm" />
                </div>
                <Button size="sm" onClick={addVariant} className="h-8">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
                </Button>
              </div>

              {/* Daftar Varian */}
              {variants.length > 0 && (
                <div className="space-y-2 mt-2">
                  {variants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: v.colorHex }} />
                        <span className="font-medium">{v.size}</span>
                        <span className="text-gray-500">— {v.color}</span>
                        <Badge variant="secondary" className="text-xs">Stok: {v.stock}</Badge>
                      </div>
                      <button onClick={() => removeVariant(v.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {variants.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada varian ditambahkan</p>
              )}
            </div>
          </div>

          {/* Sidebar Kanan */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <h2 className="font-semibold text-gray-700">Status Produk</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-black" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm">{form.isActive ? "Aktif (tampil di toko)" : "Nonaktif (tersembunyi)"}</span>
              </div>
            </div>

            {/* Upload Foto */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <h2 className="font-semibold text-gray-700">Foto Produk</h2>

              {/* Preview gambar */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img src={url} alt={`Foto ${idx + 1}`} className="object-cover w-full h-full" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 text-[9px] bg-black text-white px-1 py-0.5 rounded">Utama</span>
                      )}
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-5 w-5 text-gray-300 mx-auto mb-1.5" />
                <p className="text-sm text-gray-400">{uploadingImage ? "Mengupload..." : "Klik untuk pilih foto"}</p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP maks. 2MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </div>

            {/* Simpan */}
            <Button className="w-full" onClick={handleSave} disabled={loading || uploadingImage}>
              {loading ? "Menyimpan..." : isEdit ? "Perbarui Produk" : "Simpan Produk"}
            </Button>
          </div>
        </div>

      </main>
    </>
  );
}
