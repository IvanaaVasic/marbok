import { useMemo, useState } from "react";
import Link from "next/link";
import { FaFileExcel, FaImages, FaUpload } from "react-icons/fa6";
import { auth } from "@/config/firebase";
import { useAuth } from "@/hooks/useAuth";
import { isOwner } from "@/utils/adminAccess";
import styles from "./ProductImport.module.css";

const MAX_PRODUCTS = 200;
const BATCH_SIZE = 4;
const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sr-Latn-RS").replace(/[^a-z0-9]+/g, "").trim();

function cellText(value) {
    if (value == null) return "";
    if (typeof value === "object") {
        if (value.text) return String(value.text).trim();
        if (value.result != null) return String(value.result).trim();
        if (Array.isArray(value.richText)) return value.richText.map((part) => part.text || "").join("").trim();
    }
    return String(value).trim();
}

function findColumn(headers, aliases) {
    const wanted = aliases.map(normalize);
    return headers.findIndex((header) => wanted.includes(normalize(header)));
}

async function parseWorkbook(file) {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const products = [];
    workbook.eachSheet((sheet) => {
        let headerRow = 0;
        let columns;
        sheet.eachRow((row, rowNumber) => {
            if (headerRow) return;
            const headers = row.values.slice(1).map(cellText);
            const name = findColumn(headers, ["naziv", "naziv proizvoda", "ime proizvoda"]);
            const productKey = findColumn(headers, ["šifra", "sifra", "šifra proizvoda", "sifra proizvoda", "kod"]);
            if (name >= 0 && productKey >= 0) {
                headerRow = rowNumber;
                columns = {
                    name, productKey,
                    category: findColumn(headers, ["kategorija", "tab"]),
                    section: findColumn(headers, ["sekcija", "grupa"]),
                    package: findColumn(headers, ["pakovanje"]),
                    price: findColumn(headers, ["cena", "cena rsd"]),
                    image: findColumn(headers, ["slika", "naziv slike"]),
                };
            }
        });
        if (!headerRow) return;
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber <= headerRow) return;
            const values = row.values.slice(1).map(cellText);
            const name = values[columns.name] || "";
            const productKey = values[columns.productKey] || "";
            if (!name && !productKey) return;
            products.push({
                row: rowNumber, sheet: sheet.name, name, productKey,
                category: columns.category >= 0 ? values[columns.category] || "" : "",
                section: columns.section >= 0 ? values[columns.section] || "" : "",
                package: columns.package >= 0 ? values[columns.package] || "" : "",
                price: columns.price >= 0 ? values[columns.price] || "" : "",
                imageName: columns.image >= 0 ? values[columns.image] || "" : "",
            });
        });
    });
    return products;
}

function buildImageMap(files) {
    const map = new Map();
    Array.from(files || []).forEach((file) => {
        map.set(normalize(file.name), file);
        map.set(normalize(file.name.replace(/\.[^.]+$/, "")), file);
    });
    return map;
}

function readAsDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function prepareImage(file) {
    if (!file) return null;
    const source = await readAsDataUrl(file);
    const bitmap = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = source;
    });
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return { name: file.name, dataUrl: canvas.toDataURL("image/jpeg", 0.82) };
}

async function downloadTemplate(categories) {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Novi proizvodi");
    sheet.columns = [
        { header: "KATEGORIJA", key: "category", width: 28 },
        { header: "SEKCIJA", key: "section", width: 28 },
        { header: "NAZIV", key: "name", width: 42 },
        { header: "ŠIFRA", key: "productKey", width: 18 },
        { header: "PAKOVANJE", key: "package", width: 20 },
        { header: "CENA", key: "price", width: 15 },
        { header: "SLIKA", key: "image", width: 28 },
    ];
    const firstCategory = categories[0];
    const firstSection = firstCategory?.categoryProducts?.[0];
    sheet.addRow({ category: firstCategory?.title || "", section: firstSection?.title || "", name: "Primer proizvoda", productKey: "8057", package: "24/1*8", price: "465", image: "8057.jpg" });
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBC4D4D" } };
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    const lists = workbook.addWorksheet("Liste");
    const categoryNames = categories.map((category) => category.title).filter(Boolean);
    const sectionNames = [...new Set(categories.flatMap((category) => (category.categoryProducts || []).map((block) => block.title)).filter(Boolean))];
    lists.getCell("A1").value = "Kategorije";
    lists.getCell("B1").value = "Sekcije";
    categoryNames.forEach((name, index) => { lists.getCell(index + 2, 1).value = name; });
    sectionNames.forEach((name, index) => { lists.getCell(index + 2, 2).value = name; });
    lists.state = "veryHidden";
    for (let row = 2; row <= MAX_PRODUCTS + 1; row += 1) {
        if (categoryNames.length) sheet.getCell(row, 1).dataValidation = { type: "list", allowBlank: false, formulae: [`Liste!$A$2:$A$${categoryNames.length + 1}`] };
        if (sectionNames.length) sheet.getCell(row, 2).dataValidation = { type: "list", allowBlank: false, formulae: [`Liste!$B$2:$B$${sectionNames.length + 1}`] };
    }
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "MARBOK_Sablon_za_nove_proizvode.xlsx";
    link.click();
    URL.revokeObjectURL(url);
}

function resolveTarget(row, categories) {
    const category = categories.find((item) => normalize(item.title) === normalize(row.category));
    const block = category?.categoryProducts?.find((item) => normalize(item.title) === normalize(row.section));
    return {
        blockId: block?._id || "",
        categorySlug: category?.slug || "",
        targetError: !row.category || !row.section
            ? "Nedostaje kategorija ili sekcija"
            : !category
                ? "Kategorija ne postoji"
                : !block
                    ? "Sekcija ne pripada toj kategoriji"
                    : "",
    };
}

export default function ProductImport({ categories = [] }) {
    const { user, loading } = useAuth();
    const [rows, setRows] = useState([]);
    const [images, setImages] = useState(new Map());
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(null);
    const [result, setResult] = useState(null);
    const importing = progress && progress.done < progress.total;
    const preview = useMemo(() => rows.map((row) => ({
        ...row,
        ...resolveTarget(row, categories),
        image: images.get(normalize(row.imageName)) || images.get(normalize(row.productKey)) || null,
    })), [rows, images, categories]);
    const hasSanityImage = (row) => /^https:\/\/cdn\.sanity\.io\//i.test(row.imageName);
    const missingImages = preview.filter((row) => !row.image && !hasSanityImage(row)).length;
    const invalidRows = preview.filter((row) => !row.name || !row.productKey || !row.blockId);

    if (loading) return <main className={styles.page}><div className={styles.card}>Proveravam prijavu…</div></main>;
    if (!isOwner(user)) return <main className={styles.page}><div className={styles.card}><h1>Uvoz proizvoda</h1><p>Ova stranica je dostupna samo tvom vlasničkom nalogu.</p></div></main>;

    const handleExcel = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setError(""); setResult(null); setFileName(file.name);
        try {
            const parsed = await parseWorkbook(file);
            if (!parsed.length) throw new Error("Nisam pronašao kolone KATEGORIJA, SEKCIJA, NAZIV i ŠIFRA. Preuzmi novi šablon.");
            if (parsed.length > MAX_PRODUCTS) throw new Error(`Excel ima ${parsed.length} proizvoda. Dozvoljeno je najviše ${MAX_PRODUCTS}.`);
            setRows(parsed);
        } catch (err) { setRows([]); setError(err.message || "Excel fajl nije moguće pročitati."); }
    };

    const handleImport = async () => {
        if (!preview.length || invalidRows.length || importing) return;
        setError(""); setResult(null);
        let created = 0, skipped = 0;
        const errors = [];
        setProgress({ done: 0, total: preview.length });
        try {
            const token = await auth.currentUser.getIdToken(true);
            for (let offset = 0; offset < preview.length; offset += BATCH_SIZE) {
                const batch = preview.slice(offset, offset + BATCH_SIZE);
                const products = await Promise.all(batch.map(async (row) => ({
                    row: row.row, name: row.name, productKey: row.productKey,
                    package: row.package, price: row.price, blockId: row.blockId,
                    image: row.image ? await prepareImage(row.image) : hasSanityImage(row) ? { url: row.imageName } : null,
                })));
                const response = await fetch("/api/products/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ products }),
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.error || `Uvoz nije uspeo (greška ${response.status}).`);
                created += data.created || 0; skipped += data.skipped || 0;
                errors.push(...(data.errors || []));
                setProgress({ done: Math.min(offset + batch.length, preview.length), total: preview.length });
            }
            setResult({ created, skipped, errors });
        } catch (err) { setError(err.message || "Uvoz je prekinut. Već završene grupe su sačuvane."); setProgress(null); }
    };

    return <main className={styles.page}><section className={styles.card}>
        <Link href="/" className={styles.backLink}>← Nazad na sajt</Link>
        <div className={styles.heading}><div><span className={styles.eyebrow}>Samo za vlasnika</span><h1>Uvoz proizvoda iz Excela</h1><p>Kategoriju i sekciju izaberi u Excelu, a ovde samo dodaj Excel i slike.</p></div><button type="button" className={styles.templateButton} onClick={() => downloadTemplate(categories)}><FaFileExcel /> Preuzmi novi šablon</button></div>
        <div className={styles.uploadGrid}>
            <label className={styles.uploadBox}><FaFileExcel /><strong>1. Izaberi popunjen Excel</strong><span>{fileName || "XLSX fajl sa najviše 200 redova"}</span><input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleExcel} /></label>
            <label className={styles.uploadBox}><FaImages /><strong>2. Izaberi sve slike</strong><span>{images.size ? "Slike su učitane" : "Naziv slike neka bude šifra, npr. 8057.jpg"}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { setImages(buildImageMap(event.target.files)); setResult(null); }} /></label>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {!!preview.length && <div className={styles.summary}><strong>Pronađeno: {preview.length} proizvoda</strong><span>{invalidRows.length ? `Ispravi redove: ${invalidRows.length}` : missingImages ? `Bez pronađene slike: ${missingImages}` : "Sve je spremno za uvoz"}</span></div>}
        {!!preview.length && <div className={styles.tableWrap}><table><thead><tr><th>Red</th><th>Kategorija</th><th>Sekcija</th><th>Naziv</th><th>Šifra</th><th>Slika</th></tr></thead><tbody>{preview.slice(0, 12).map((row, index) => <tr key={`${row.productKey}-${index}`}><td>{row.row}</td><td>{row.category || <em>Nedostaje</em>}</td><td className={row.targetError ? styles.missing : ""}>{row.section || <em>Nedostaje</em>}{row.targetError && <small className={styles.rowError}>{row.targetError}</small>}</td><td>{row.name || <em>Nedostaje</em>}</td><td>{row.productKey || <em>Nedostaje</em>}</td><td className={row.image || hasSanityImage(row) ? styles.ok : styles.missing}>{row.image ? row.image.name : hasSanityImage(row) ? "Sanity slika" : "Nema"}</td></tr>)}</tbody></table>{preview.length > 12 && <p className={styles.more}>…i još {preview.length - 12} proizvoda</p>}</div>}
        {progress && <div className={styles.progress}><div style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} /><span>{progress.done} / {progress.total}</span></div>}
        {result && <><div className={styles.success}><strong>Uvoz je završen.</strong><span>Dodato: {result.created} · Preskočeno postojećih: {result.skipped} · Upozorenja: {result.errors.length}</span></div>{result.errors.length > 0 && <ul className={styles.warningList}>{result.errors.slice(0, 20).map((item, index) => <li key={`${item.row}-${index}`}>Red {item.row}: {item.message}</li>)}</ul>}</>}
        <button type="button" className={styles.importButton} disabled={!preview.length || invalidRows.length > 0 || importing} onClick={handleImport}><FaUpload />{importing ? `Uvozim ${progress.done}/${progress.total}…` : invalidRows.length ? "Ispravi označene redove" : `Uvezi ${preview.length || ""} proizvoda`}</button>
    </section></main>;
}
