import { requireFirebaseUser } from "@/server/requireFirebaseUser";
import { getPages, getImages, getHeading, getBrandImages, getAboutUs, getCategories } from "@/sanity/sanity-utils";

const READERS = { pages: getPages, images: getImages, heading: getHeading,
    brands: getBrandImages, about: getAboutUs, categories: getCategories };

export default async function handler(req, res) {
    if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).end(); }
    if (!(await requireFirebaseUser(req, res))) return;
    const reader = READERS[req.query.kind];
    if (!reader) return res.status(400).json({ error: "Nepoznata vrsta podataka." });
    try { return res.status(200).json({ data: await reader() }); }
    catch { return res.status(502).json({ error: "Katalog nije dostupan." }); }
}
