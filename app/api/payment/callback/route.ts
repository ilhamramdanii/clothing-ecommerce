import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;

    // Verifikasi signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      return NextResponse.json({ message: "Signature tidak valid" }, { status: 401 });
    }

    // Tentukan status pembayaran
    let paymentStatus: "PAID" | "FAILED" | "EXPIRED" = "FAILED";
    let orderStatus: "PAID" | "CANCELLED" | null = null;

    if (transaction_status === "capture" && fraud_status === "accept") {
      paymentStatus = "PAID";
      orderStatus = "PAID";
    } else if (transaction_status === "settlement") {
      paymentStatus = "PAID";
      orderStatus = "PAID";
    } else if (transaction_status === "expire") {
      paymentStatus = "EXPIRED";
      orderStatus = "CANCELLED";
    } else if (["deny", "cancel", "failure"].includes(transaction_status)) {
      paymentStatus = "FAILED";
      orderStatus = "CANCELLED";
    }

    // Update payment
    await prisma.payment.update({
      where: { midtransOrderId: order_id },
      data: {
        status: paymentStatus,
        method: body.payment_type,
        paidAt: paymentStatus === "PAID" ? new Date() : undefined,
        rawResponse: body,
      },
    });

    // Update order
    if (orderStatus) {
      await prisma.order.update({
        where: { orderNumber: order_id },
        data: {
          status: orderStatus,
          paymentStatus,
          paymentMethod: "MIDTRANS",
        },
      });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
