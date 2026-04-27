"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";

type Address = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

const emptyForm = {
  label: "",
  recipientName: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/addresses");
      if (res.status === 401) { router.push("/account/login"); return; }
      const data = await res.json();
      setAddresses(data);
    } catch {
      toast.error("Gagal memuat alamat");
    } finally {
      setFetching(false);
    }
  }, [router]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditId(addr.id);
    setForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editId ? `/api/customer/addresses/${editId}` : "/api/customer/addresses";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Gagal menyimpan alamat");
        return;
      }
      toast.success(editId ? "Alamat berhasil diperbarui" : "Alamat berhasil ditambahkan");
      setShowForm(false);
      fetchAddresses();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus alamat ini?")) return;
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Gagal menghapus alamat");
        return;
      }
      toast.success("Alamat dihapus");
      fetchAddresses();
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">

      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alamat Saya</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola alamat pengiriman kamu</p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Alamat
          </Button>
        )}
      </div>

      {/* Form Tambah/Edit */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-sm text-gray-700 mb-4">
            {editId ? "Edit Alamat" : "Alamat Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Label Alamat</Label>
                <Input placeholder="Rumah / Kantor" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Penerima</Label>
                <Input placeholder="Nama lengkap" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nomor HP</Label>
              <Input type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Alamat Lengkap</Label>
              <Input placeholder="Nama jalan, nomor, RT/RW" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Kota</Label>
                <Input placeholder="Jakarta Selatan" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Provinsi</Label>
                <Input placeholder="DKI Jakarta" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Kode Pos</Label>
              <Input placeholder="12345" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Jadikan alamat utama</span>
            </label>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Menyimpan..." : "Simpan Alamat"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Batal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Alamat */}
      {fetching ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <MapPin className="h-10 w-10 text-gray-200" />
          <p className="text-gray-400 text-sm">Belum ada alamat tersimpan</p>
          <Button size="sm" variant="outline" onClick={openAdd}>Tambah Alamat Pertama</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-xl border p-4 ${addr.isDefault ? "border-black" : "border-gray-100"}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Star className="h-2.5 w-2.5 fill-current" /> Utama
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(addr)}
                    className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="font-medium text-sm">{addr.recipientName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
              <p className="text-xs text-gray-500 mt-0.5">{addr.address}, {addr.city}, {addr.province} {addr.postalCode}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
