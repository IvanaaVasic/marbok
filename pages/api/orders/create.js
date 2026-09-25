import crypto from "crypto";
import { requireFirebaseUser } from "@/server/requireFirebaseUser";
import { resolveAccountAccess } from "@/server/accountAccess";
import { serverSanityClient } from "@/server/sanityClient";
import { isOwner } from "@/utils/adminAccess";

function parsePrice(value) {
    const normalized = String(value ?? "").replace(/\s/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    const number = Number(normalized);
    return Number.isFinite(number) && number >= 0 ? number : NaN;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    const user = await requireFirebaseUser(req, res);
    if (!user) return;
    const input = req.body || {};
    const items = Array.isArray(input.items) ? input.items : [];
    if (!items.length || items.length > 100 || items.some(item =>
        typeof item.productKey !== "string" || !item.productKey || item.productKey.length > 100 ||
        !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 10000
    )) return res.status(400).json({ error: "Neispravni proizvodi ili količine." });

    try {
        const client = serverSanityClient();
        const access = await resolveAccountAccess(client, user);
        if (access.status !== "approved") return res.status(403).json({ error: "Nalog još nije odobren." });
        const keys = [...new Set(items.map(item => item.productKey))];
        if (keys.length !== items.length) return res.status(400).json({ error: "Proizvod je ponovljen." });
        const products = await client.fetch(`*[_type == "productInfo" && productKey in $keys]{productKey,name,price}`, { keys });
        const byKey = new Map(products.map(product => [product.productKey, product]));
        if (byKey.size !== items.length || products.some(product => !Number.isFinite(parsePrice(product.price)))) {
            return res.status(400).json({ error: "Proizvod ili cena više nisu dostupni. Osveži korpu." });
        }
        const safeItems = items.map(item => ({
            _key: crypto.randomBytes(12).toString("hex"),
            name: byKey.get(item.productKey).name,
            productKey: item.productKey,
            price: byKey.get(item.productKey).price,
            quantity: Number(item.quantity),
        }));
        const totalPrice = safeItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
        const orderNumber = `ORD-${Date.now()}${crypto.randomInt(100000, 999999)}`;
        const selectedStore = isOwner(user) && typeof input.storeId === "string" && input.storeId.length < 130
            ? await client.fetch(`*[_type == "store" && _id == $id && (!defined(approvalStatus) || approvalStatus == "approved")][0]{pass}`, { id: input.storeId })
            : null;
        const order = await client.create({
            _type: "order", orderNumber,
            firebaseUid: user.localId,
            companyName: String(input.companyName || "").slice(0, 160),
            customerName: String(input.firstName || "").slice(0, 120),
            email: user.email,
            phone: String(input.phone || "").slice(0, 50),
            message: String(input.message || "").slice(0, 2000),
            pib: String(input.pib || "").slice(0, 20),
            pass: selectedStore?.pass || "",
            items: safeItems, totalPrice: `${totalPrice} rsd`, createdAt: new Date().toISOString(),
        });
        return res.status(201).json({ order });
    } catch (error) {
        console.error("Order creation failed", error);
        return res.status(502).json({ error: "Porudžbina nije sačuvana. Pokušaj ponovo." });
    }
}
