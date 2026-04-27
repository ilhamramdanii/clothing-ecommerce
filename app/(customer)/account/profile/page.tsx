"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/customer/profile")
      .then((r) => {
        if (r.status === 401) { router.push("/account/login"); return null; }
        return r.json();
      })
      .then((data: Customer | null) => {
        if (data) {
          setForm((f) => ({ ...f, name: data.name, phone: data.phone ?? "" }));
        }
      })
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setFetching(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Gagal menyimpan");
        return;
      }
      toast.success("Profil berhasil disimpan!");
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-6">

      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Edit Profil</h1>
        <p className="text-sm text-gray-400 mt-1">Ubah data diri dan password kamu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Data Diri */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700">Data Diri</h2>

          <div className="space-y-1.5">
            <Label>Nama Lengkap</Label>
            <Input
              placeholder="Nama kamu"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Nomor HP</Label>
            <Input
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Ganti Password */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-sm text-gray-700">Ganti Password</h2>
            <p className="text-xs text-gray-400 mt-0.5">Kosongkan jika tidak ingin mengganti password</p>
          </div>

          <div className="space-y-1.5">
            <Label>Password Lama</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Password Baru</Label>
            <Input
              type="password"
              placeholder="Min. 6 karakter"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Konfirmasi Password Baru</Label>
            <Input
              type="password"
              placeholder="Ulangi password baru"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>

      </form>
    </div>
  );
}
