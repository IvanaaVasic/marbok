import { createClient } from "next-sanity";
import clientConfig from "@/sanity/config/client-config";
import { requireOwner } from "@/server/requireOwner";

export default async function handler(req, res) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", "DELETE");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    if (!(await requireOwner(req, res))) return;
    const { id } = req.query;
    if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
        return res.status(400).json({ error: "Neispravna porudžbina." });
    }
    try {
        // A constrained query can only delete this order, never a store or product.
        await createClient({ ...clientConfig, useCdn: false }).delete({
            query: '*[_type == "order" && _id == $id]', params: { id },
        });
        return res.status(200).json({ deletedId: id });
    } catch {
        return res.status(502).json({ error: "Porudžbina nije obrisana. Pokušaj ponovo." });
    }
}
