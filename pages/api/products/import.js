import crypto from "crypto";
import { createClient } from "next-sanity";
import clientConfig from "@/sanity/config/client-config";
import { requireOwner } from "@/server/requireOwner";

export const config = { api: { bodyParser: { sizeLimit: "15mb" } }, maxDuration: 60 };
const MAX_BATCH_SIZE = 8;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const text = (value) => String(value ?? "").trim();
const normalize = (value) => text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sr-Latn-RS").replace(/\s+/g, " ");
const productId = (key) => `productInfo.${crypto.createHash("sha256").update(normalize(key)).digest("hex").slice(0, 32)}`;

function sanityImageReference(url) {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        if (parsed.hostname !== "cdn.sanity.io") return null;
        const filename = decodeURIComponent(parsed.pathname.split("/").pop() || "");
        const match = /^([a-zA-Z0-9]+)-(\d+x\d+)\.([a-zA-Z0-9]+)$/.exec(filename);
        return match ? `image-${match[1]}-${match[2]}-${match[3].toLowerCase()}` : null;
    } catch { return null; }
}

async function uploadImage(client, image) {
    if (!image?.dataUrl) {
        const reference = sanityImageReference(image?.url);
        return reference ? { _type: "image", asset: { _type: "reference", _ref: reference } } : null;
    }
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/.exec(image.dataUrl);
    if (!match) throw new Error("Format slike nije podržan.");
    const buffer = Buffer.from(match[2], "base64");
    if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw new Error("Slika mora biti manja od 6 MB.");
    const asset = await client.assets.upload("image", buffer, {
        filename: text(image.name) || "proizvod.jpg",
        contentType: match[1],
    });
    return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Metoda nije dozvoljena." });
    }
    if (!(await requireOwner(req, res))) return;
    const products = Array.isArray(req.body?.products) ? req.body.products : [];
    if (!products.length || products.length > MAX_BATCH_SIZE) {
        return res.status(400).json({ error: `Jedna grupa mora imati od 1 do ${MAX_BATCH_SIZE} proizvoda.` });
    }

    const client = createClient({ ...clientConfig, useCdn: false });
    try {
        const structures = await client.fetch(`*[_type == "categoryPage"]{_id,title,categoryProducts[]->{_id,title}}`);
        const blocks = new Map();
        (structures || []).forEach((category) => (category.categoryProducts || []).forEach((block) => blocks.set(block._id, block)));
        const keys = products.map((product) => text(product.productKey)).filter(Boolean);
        const existing = await client.fetch(`*[_type == "productInfo" && productKey in $keys]{productKey}`, { keys });
        const existingKeys = new Set((existing || []).map((item) => normalize(item.productKey)));
        const seenKeys = new Set();
        const valid = [];
        const errors = [];
        let skipped = 0;

        products.forEach((product, index) => {
            const row = Number(product.row) || index + 2;
            const name = text(product.name);
            const productKey = text(product.productKey);
            const block = blocks.get(text(product.blockId));
            const key = normalize(productKey);
            if (!name || !productKey) errors.push({ row, message: "Nedostaje naziv ili šifra proizvoda." });
            else if (!block) errors.push({ row, message: "Izabrana sekcija nije pronađena." });
            else if (existingKeys.has(key) || seenKeys.has(key)) skipped += 1;
            else { seenKeys.add(key); valid.push({ ...product, row, name, productKey, block }); }
        });
        if (!valid.length) return res.status(200).json({ created: 0, skipped, errors });

        const prepared = await Promise.all(valid.map(async (product) => {
            try { return { ...product, sanityImage: await uploadImage(client, product.image) }; }
            catch (error) {
                errors.push({ row: product.row, message: `Slika nije učitana: ${error.message}` });
                return { ...product, sanityImage: null };
            }
        }));

        let transaction = client.transaction();
        prepared.forEach((product) => {
            const id = productId(product.productKey);
            const document = {
                _id: id, _type: "productInfo", name: product.name,
                productKey: product.productKey,
                price: text(product.price).replace(/\s*RSD\s*$/i, ""),
                package: text(product.package),
            };
            if (product.sanityImage) document.image = product.sanityImage;
            transaction = transaction.create(document).patch(product.block._id, (patch) => patch
                .setIfMissing({ contentArea: [] })
                .append("contentArea", [{ _type: "reference", _key: crypto.randomBytes(12).toString("hex"), _ref: id }]));
        });
        await transaction.commit({ autoGenerateArrayKeys: true });
        return res.status(200).json({ created: prepared.length, skipped, errors });
    } catch (error) {
        console.error("Product import failed:", error);
        const reason = String(error?.message || "Nepoznata greška").slice(0, 220);
        return res.status(502).json({ error: `Sanity nije prihvatio ovu grupu: ${reason}` });
    }
}
