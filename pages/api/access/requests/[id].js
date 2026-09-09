import { createClient } from "next-sanity";
import clientConfig from "@/sanity/config/client-config";
import { requireOwner } from "@/server/requireOwner";

const ALLOWED = new Set(["approved", "rejected"]);

export default async function handler(req, res) {
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    if (!(await requireOwner(req, res))) return;

    const id = String(req.query.id || "");
    const status = String(req.body?.status || "");
    if (!/^[-a-zA-Z0-9_.]+$/.test(id) || !ALLOWED.has(status)) {
        return res.status(400).json({ error: "Neispravan zahtev." });
    }

    try {
        const client = createClient({ ...clientConfig, useCdn: false });
        const request = await client
            .patch(id)
            .set({ approvalStatus: status, reviewedAt: new Date().toISOString() })
            .commit();
        return res.status(200).json({ request });
    } catch {
        return res.status(502).json({ error: "Promenu trenutno nije moguće sačuvati." });
    }
}
