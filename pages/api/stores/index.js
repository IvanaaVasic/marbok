import { requireOwner } from "@/server/requireOwner";
import { serverSanityClient } from "@/server/sanityClient";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    if (!(await requireOwner(req, res))) return;
    try {
        const stores = await serverSanityClient().fetch(`*[_type == "store" && (!defined(approvalStatus) || approvalStatus == "approved")]{_id,name,pib,address,phone,email,contactPerson,pass}`);
        return res.status(200).json({ stores });
    } catch {
        return res.status(502).json({ error: "Prodavnice trenutno nisu dostupne." });
    }
}
