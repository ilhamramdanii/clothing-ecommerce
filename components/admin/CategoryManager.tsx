"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

type Category = { id: string; name: string; slug: string; productCount: number; isActive: boolean };

export default function CategoryManager({ initialCategories, skip = 0 }: { initialCategories: Category[]; skip?: number }) {
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error("Isi nama kategori"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setCategories((prev) => [...prev, { ...data, productCount: 0 }]);
      setNewName("");
      toast.success("Kategori ditambahkan");
    } catch { toast.error("Gagal menambahkan"); }
    finally { setLoading(false); }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) { toast.error("Isi nama"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: data.name, slug: data.slug } : c));
      setEditId(null);
      toast.success("Berhasil diupdate");
    } catch { toast.error("Gagal update"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus kategori ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); toast.error(d.message); return; }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kategori dihapus");
    } catch { toast.error("Gagal hapus"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Add new */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Tambah Kategori Baru</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Nama kategori..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="inline-flex items-center gap-1 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 text-gray-400 font-medium w-10">#</th>
              <th className="text-left p-4 text-gray-400 font-medium">Nama</th>
              <th className="text-left p-4 text-gray-400 font-medium">Slug</th>
              <th className="text-left p-4 text-gray-400 font-medium">Produk</th>
              <th className="text-left p-4 text-gray-400 font-medium">Status</th>
              <th className="text-left p-4 text-gray-400 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-400">{skip + i + 1}</td>
                <td className="p-4">
                  {editId === cat.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-40 outline-none focus:border-gray-500"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium">{cat.name}</span>
                  )}
                </td>
                <td className="p-4 text-gray-400 font-mono text-xs">{cat.slug}</td>
                <td className="p-4">{cat.productCount}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {cat.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {editId === cat.id ? (
                      <>
                        <button onClick={() => handleEdit(cat.id)} disabled={loading} className="text-green-600 hover:text-green-800"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="text-blue-500 hover:text-blue-700"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(cat.id)} disabled={loading || cat.productCount > 0} className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed" title={cat.productCount > 0 ? "Ada produk di kategori ini" : "Hapus"}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
