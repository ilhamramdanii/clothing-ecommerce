import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { snap } from "@/lib/midtrans";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, addressId, items, shippingCost, shippingCourier, shippingService, notes } = body;

    if (!customerId || !addressId || !items?.length) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Hitung total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) return NextResponse.json({ message: `Varian tidak ditemukan` }, { status: 404 });
      if (variant.stock < item.quantity) return NextResponse.json({ message: `Stok ${variant.product.name} tidak cukup` }, { status: 400 });

      const price = variant.price || variant.product.price;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: variant.productId,
        variantId: variant.id,
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal,
      });
    }

    const total = subtotal + (shippingCost || 0);
    const orderNumber = generateOrderNumber();

    // Buat order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        addressId,
        subtotal,
        shippingCost: shippingCost || 0,
        total,
        shippingCourier,
        shippingService,
        notes,
        items: { create: orderItems },
      },
      include: { customer: true, items: true },
    });

    // Buat Midtrans Snap token
    const snapTransaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderNumber,
        gross_amount: total,
      },
      customer_details: {
        first_name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone || undefined,
      },
      item_details: orderItems.map((item, i) => ({
        id: item.variantId,
        price: item.price,
        quantity: item.quantity,
        name: items[i].name || "Produk",
      })),
    });

    // Simpan payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        midtransOrderId: orderNumber,
        snapToken: snapTransaction.token,
        snapUrl: snapTransaction.redirect_url,
        amount: total,
      },
    });

    // Kurangi stok
    for (const item of items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      snapToken: snapTransaction.token,
      snapUrl: snapTransaction.redirect_url,
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal membuat pesanan" }, { status: 500 });
  }
}
