import { requireFirebaseUser } from "@/server/requireFirebaseUser";
import { canReadOrder } from "@/server/orderAccess";
import { serverSanityClient } from "@/server/sanityClient";
import { buildOrderEmailParams } from "@/server/orderEmail";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    const user = await requireFirebaseUser(req, res);
    if (!user) return;
    const { orderNumber } = req.body || {};
    if (typeof orderNumber !== "string" || !/^ORD-\d{10,20}$/.test(orderNumber)) {
        return res.status(400).json({ error: "Neispravan broj porudžbine." });
    }
    try {
        const client = serverSanityClient();
        const order = await client.fetch(`*[_type == "order" && orderNumber == $orderNumber][0]{_id,orderNumber,companyName,customerName,email,phone,message,pib,items[]{name,quantity,productKey,price},orderExcelUrl,emailSentAt,firebaseUid}`, { orderNumber });
        if (!canReadOrder(user, order)) return res.status(404).json({ error: "Porudžbina nije pronađena." });
        if (order.emailSentAt) return res.status(200).json({ sent: true });
        if (!process.env.RESEND_API_KEY || !process.env.ORDER_NOTIFICATION_EMAIL || !process.env.ORDER_FROM_EMAIL || !process.env.NEXT_PUBLIC_SITE_URL) {
            return res.status(503).json({ error: "Email obaveštenje još nije podešeno." });
        }
        const params = buildOrderEmailParams(order, {
            orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/order/${orderNumber}`,
            orderExcelUrl: order.orderExcelUrl || "",
        });
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                from: process.env.ORDER_FROM_EMAIL,
                to: [process.env.ORDER_NOTIFICATION_EMAIL],
                subject: `Nova porudžbina ${orderNumber}`,
                text: params.message,
            }),
            signal: AbortSignal.timeout(12000),
        });
        if (!response.ok) throw new Error(`Resend status ${response.status}`);
        await client.patch(order._id).set({ emailSentAt: new Date().toISOString() }).commit();
        return res.status(200).json({ sent: true });
    } catch (error) {
        console.error("Order email delivery failed", error);
        return res.status(502).json({ error: "Porudžbina je sačuvana, ali email trenutno nije poslat." });
    }
}
