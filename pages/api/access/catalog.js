import { createClient } from "next-sanity";
import clientConfig from "@/sanity/config/client-config";
import { requireFirebaseUser } from "@/server/requireFirebaseUser";
import { resolveAccountAccess } from "@/server/accountAccess";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    const user = await requireFirebaseUser(req, res);
    if (!user) return;

    try {
        const client = createClient({ ...clientConfig, useCdn: false });
        const { status } = await resolveAccountAccess(client, user);
        if (status !== "approved") return res.status(200).json({ status, prices: {} });

        const products = await client.fetch(
            `*[_type == "productInfo" && defined(price)]{_id, price}`
        );
        const prices = Object.fromEntries(products.map((product) => [product._id, product.price]));
        return res.status(200).json({ status, prices });
    } catch {
        return res.status(502).json({ error: "Pristup cenama trenutno nije moguće proveriti." });
    }
}
