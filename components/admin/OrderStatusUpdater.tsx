"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  orderId: string;
  currentStatus: string;
};

const transitions: Record<string, { next: string; label: string }> = {
  PAID:       { next: "PROCESSING", label: "Proses Pesanan" },
  PROCESSING: { next: "SHIPPED",    label: "Tandai Dikirim" },
  SHIPPED:    { next: "DELIVERED",  label: "Tandai Diterima" },
};

export default function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const transition = transitions[status];

  if (!transition) return <p className="text-xs text-gray-400">Tidak ada aksi tersedia</p>;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: transition.next }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Gagal memperbarui status");
        return;
      }
      setStatus(transition.next);
      toast.success(`Status diperbarui ke ${transition.next}`);
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" className="w-full mt-1" onClick={handleUpdate} disabled={loading}>
      {loading ? "Memperbarui..." : transition.label}
    </Button>
  );
}
