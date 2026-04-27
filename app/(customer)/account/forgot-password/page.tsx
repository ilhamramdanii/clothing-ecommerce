"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", newPassword: "", confirmPassword: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Gagal mengubah password");
        return;
      }
      toast.success("Password berhasil diubah! Silakan login.");
      router.push("/account/login");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <Link href="/account/login" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Login
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Lupa Password</h1>
          <p className="text-sm text-gray-400 mt-1">Masukkan email dan password baru kamu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@kamu.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Password Baru</Label>
            <Input
              type="password"
              placeholder="Min. 6 karakter"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Konfirmasi Password Baru</Label>
            <Input
              type="password"
              placeholder="Ulangi password baru"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Ubah Password"}
          </Button>
        </form>

      </div>
    </div>
  );
}
