import { requireFirebaseUser } from "@/server/requireFirebaseUser";
import { serverSanityClient } from "@/server/sanityClient";
import { canReadOrder } from "@/server/orderAccess";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    const user = await requireFirebaseUser(req, res);
    if (!user) return;
    const number = req.query.number;
    if (typeof number !== "string" || !/^ORD-\d{10,20}$/.test(number)) return res.status(400).json({ error: "Neispravna porudžbina." });
    try {
        const order = await serverSanityClient().fetch(
            `*[_type == "order" && orderNumber == $number][0]{..., items[]{..., "productDetails": *[_type == "productInfo" && productKey == ^.productKey][0]{name,image,productKey,package}}}`,
            { number }
        );
        if (!canReadOrder(user, order)) return res.status(404).json({ error: "Porudžbina nije pronađena." });
        return res.status(200).json({ order });
    } catch {
        return res.status(502).json({ error: "Porudžbina trenutno nije dostupna." });
    }
}
