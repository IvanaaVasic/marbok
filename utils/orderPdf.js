import { orderItems, orderTotal, parseOrderPrice, formatOrderPrice } from "./orderDocument";
import { urlFromThumbnail } from "./image";

function base64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(binary);
}
async function loadFont() {
    const response = await fetch("/fonts/RedHatDisplay-Regular.ttf");
    if (!response.ok) throw new Error("Font za PDF nije učitan. Pokušaj ponovo.");
    return base64(new Uint8Array(await response.arrayBuffer()));
}
async function loadImage(item) {
    try {
        if (!item.image) return null;
        const url = urlFromThumbnail(item.image);
        const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}w=100&h=100&fit=fill&bg=ffffff&fm=jpg&q=75`, { signal: AbortSignal.timeout(12000) });
        return response.ok ? new Uint8Array(await response.arrayBuffer()) : null;
    } catch { return null; }
}
// Optional resources let the same renderer be checked without network requests.
export async function createOrderPdfFile(order, resources = {}) {
    const [{ jsPDF }, { autoTable }, font] = await Promise.all([
        import("jspdf"), import("jspdf-autotable"), resources.fontBase64 || loadFont(),
    ]);
    const items = orderItems(order);
    const images = resources.images || await Promise.all(items.map(loadImage));
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
    doc.addFileToVFS("RedHat.ttf", font);
    doc.addFont("RedHat.ttf", "RedHat", "normal");
    doc.setFont("RedHat", "normal");
    doc.setTextColor(127, 41, 41); doc.setFontSize(16);
    doc.text("MARBOK | PORUDŽBINA", 10, 16);
    doc.setFontSize(10); doc.setTextColor(40);
    doc.text(String(order.orderNumber || ""), 10, 23);
    const date = order.createdAt ? new Date(order.createdAt).toLocaleString("sr-Latn-RS") : "";
    const details = [
        `Kupac: ${order.customerName || ""}`,
        [date && `Datum: ${date}`, order.pib && `PIB: ${order.pib}`, order.pass && `Šifra kupca: ${order.pass}`].filter(Boolean).join(" | "),
        [order.email && `Email: ${order.email}`, order.phone && `Telefon: ${order.phone}`].filter(Boolean).join(" | "),
        order.message && `Napomena: ${order.message}`,
    ].filter(Boolean);
    autoTable(doc, { startY: 27, margin: { left: 10, right: 10, top: 12, bottom: 14 },
        body: details.map(text => [text]), theme: "plain",
        styles: { font: "RedHat", fontStyle: "normal", fontSize: 8.5, cellPadding: 1.2, textColor: 40 },
    });
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 4,
        margin: { left: 10, right: 10, top: 12, bottom: 16 },
        head: [["Slika", "Šifra", "Naziv / pakovanje", "Cena RSD", "Kol.", "Iznos RSD"]],
        body: items.map(item => ["", item.productKey || "-", `${item.name}${item.package ? `\nPakovanje: ${item.package}` : ""}`,
            item.price === undefined || item.price === "" ? "-" : formatOrderPrice(parseOrderPrice(item.price)),
            String(item.quantity ?? ""), item.price === undefined || item.price === "" ? "-" : formatOrderPrice(parseOrderPrice(item.price) * (parseInt(item.quantity, 10) || 0))]),
        foot: [[{ content: "UKUPNO", colSpan: 5, styles: { halign: "right" } }, { content: formatOrderPrice(orderTotal(order)), styles: { halign: "right" } }]],
        showFoot: "lastPage", theme: "grid", rowPageBreak: "avoid",
        styles: { font: "RedHat", fontStyle: "normal", fontSize: 8.5, cellPadding: 1.5, minCellHeight: 13, valign: "middle", lineColor: [218,218,218], lineWidth: .15 },
        headStyles: { fillColor: [127,41,41], textColor: 255, fontStyle: "normal", minCellHeight: 7 },
        footStyles: { fillColor: [248,238,238], textColor: [127,41,41], fontStyle: "normal", minCellHeight: 8 },
        columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 23 }, 2: { cellWidth: 78 }, 3: { cellWidth: 25, halign: "right" }, 4: { cellWidth: 14, halign: "center" }, 5: { cellWidth: 35, halign: "right" } },
        didDrawCell: data => {
            if (data.section !== "body" || data.column.index !== 0) return;
            const image = images[data.row.index];
            if (image) {
                try {
                    const info = doc.getImageProperties(image);
                    const scale = Math.min(10 / info.width, 10 / info.height);
                    const width = info.width * scale, height = info.height * scale;
                    doc.addImage(image, "JPEG", data.cell.x + (data.cell.width - width) / 2,
                        data.cell.y + (data.cell.height - height) / 2, width, height);
                } catch { /* Keep the order readable when an image is invalid. */ }
            }
        },
    });
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
        doc.setPage(page); doc.setFont("RedHat", "normal"); doc.setFontSize(8); doc.setTextColor(100);
        doc.text(`${order.orderNumber || "Porudžbina"} | ${page} / ${pages}`, 200, 289, { align: "right" });
    }
    return new File([doc.output("arraybuffer")], `MARBOK_Porudzbina_${order.orderNumber}.pdf`, { type: "application/pdf" });
}
