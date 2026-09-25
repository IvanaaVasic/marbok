import { requireFirebaseUser } from "@/server/requireFirebaseUser";
import { canReadOrder } from "@/server/orderAccess";
import { serverSanityClient } from "@/server/sanityClient";

export const config = { api: { bodyParser: { sizeLimit: "5mb" } } };

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    const user = await requireFirebaseUser(req, res);
    if (!user) return;
    const { orderNumber, data } = req.body || {};
    if (typeof orderNumber !== "string" || !/^ORD-\d{10,20}$/.test(orderNumber) ||
        typeof data !== "string" || data.length > 6_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
        return res.status(400).json({ error: "Neispravan Excel fajl." });
    }
    try {
        const client = serverSanityClient();
        const order = await client.fetch(`*[_type == "order" && orderNumber == $orderNumber][0]{_id,email,firebaseUid}`, { orderNumber });
        if (!canReadOrder(user, order)) return res.status(404).json({ error: "Porudžbina nije pronađena." });
        const buffer = Buffer.from(data, "base64");
        if (!buffer.length || buffer.length > 4_000_000 || buffer.readUInt32BE(0) !== 0x504b0304) {
            return res.status(400).json({ error: "Neispravan Excel fajl." });
        }
        const asset = await client.assets.upload("file", buffer, {
            filename: `MARBOK_Porudzbina_${orderNumber}.xlsx`,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        await client.patch(order._id).set({ orderExcelUrl: asset.url }).commit();
        return res.status(200).json({ url: asset.url });
    } catch {
        return res.status(502).json({ error: "Excel trenutno nije moguće sačuvati." });
    }
}
