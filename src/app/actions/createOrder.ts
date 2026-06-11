"use server";

import { db } from "@/lib/firebase/admin";
import { stripe } from "@/lib/stripe/server";

export async function createOrder(data: any) {
  try {
    // 1. Create Firestore Document
    const orderRef = db.collection("orders").doc();
    
    const orderData = {
      id: orderRef.id,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      customer: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      delivery: {
        method: data.deliveryMethod,
        courierDetails: data.deliveryMethod === "kurier" ? {
          street: data.street,
          building: data.building,
          city: data.city,
          postalCode: data.postalCode,
        } : null,
        paczkomatDetails: data.deliveryMethod === "paczkomat" ? {
          lockerId: data.lockerId,
          address: data.lockerAddress,
        } : null,
      },
      billing: {
        wantsInvoice: data.wantsInvoice,
        nip: data.wantsInvoice ? data.nip : null,
        companyName: data.wantsInvoice ? data.companyName : null,
      },
      items: data.items,
      totals: {
        subtotal: data.subtotal,
        shipping: data.shippingCost,
        total: data.total,
      }
    };

    await orderRef.set(orderData);

    // 2. Create Stripe Checkout Session
    const line_items = data.items.map((item: any) => ({
      price_data: {
        currency: 'pln',
        product_data: {
          name: `Arkusz naklejek (Szerokość: ${item.widthCm}cm, Ilość: ${item.stickersPerSheet} szt.)`,
          images: [item.imageUrl], // Stripe can display this if it's publicly accessible
        },
        unit_amount: Math.round(item.pricePerSheet * 100), // in grosze
      },
      quantity: item.sheetQuantity,
    }));

    // Add shipping line item
    line_items.push({
      price_data: {
        currency: 'pln',
        product_data: {
          name: `Dostawa: ${data.deliveryMethod === 'kurier' ? 'Kurier' : 'Paczkomat InPost'}`,
        },
        unit_amount: Math.round(data.shippingCost * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/zamowienie-sukces?orderId=${orderRef.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
      client_reference_id: orderRef.id,
      customer_email: data.email,
      metadata: {
        orderId: orderRef.id,
      },
    });

    return { success: true, url: session.url };
  } catch (error: any) {
    console.error("createOrder error:", error);
    return { success: false, error: error.message };
  }
}
