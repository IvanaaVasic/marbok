import { requireFirebaseUser } from "@/server/requireFirebaseUser";
import { serverSanityClient } from "@/server/sanityClient";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    const user = await requireFirebaseUser(req, res);
    if (!user) return;
    const body = req.body || {};
    try {
        const client = serverSanityClient();
        const existing = await client.fetch(`*[_type == "store" && firebaseUid == $uid][0]._id`, { uid: user.localId });
        if (existing) return res.status(200).json({ registered: true });
        await client.create({
            _type: "store", firebaseUid: user.localId, email: user.email,
            name: String(body.name || user.email).slice(0, 160),
            pib: String(body.pib || "").slice(0, 20),
            address: String(body.address || "").slice(0, 250),
            phone: String(body.phone || "").slice(0, 50),
            contactPerson: String(body.contactPerson || "").slice(0, 120),
            approvalStatus: "pending", registeredAt: new Date().toISOString(),
        });
        return res.status(201).json({ registered: true });
    } catch {
        return res.status(502).json({ error: "Registracija nije sačuvana. Pokušaj ponovo." });
    }
}
