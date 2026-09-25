import { createClient } from "next-sanity";
import clientConfig from "@/sanity/config/client-config";
import { requireOwner } from "@/server/requireOwner";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    if (!(await requireOwner(req, res))) return;

    try {
        const client = createClient({ ...clientConfig, useCdn: false });
        const requests = await client.fetch(
            `*[_type == "store" && defined(approvalStatus)] | order(registeredAt desc, _createdAt desc){
                _id, name, pib, address, phone, email, contactPerson,
                approvalStatus, registeredAt
            }`
        );
        return res.status(200).json({ requests });
    } catch {
        return res.status(502).json({ error: "Zahteve trenutno nije moguće učitati." });
    }
}
