import { urlFromThumbnail } from "@/utils/image";

const BRAND_COLOR = "FFBC4D4D";
const LIGHT_BRAND_COLOR = "FFFFF4F4";

function parsePrice(price) {
    const normalized = String(price || "")
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");

    return parseFloat(normalized) || 0;
}

function formatPrice(price) {
    return new Intl.NumberFormat("sr-Latn-RS", {
        maximumFractionDigits: 2,
    }).format(price);
}

async function imageAsDataUrl(source) {
    const originalUrl = urlFromThumbnail(source);
    if (!originalUrl) return null;

    const separator = originalUrl.includes("?") ? "&" : "?";
    const imageUrl = `${originalUrl}${separator}w=90&h=90&fit=max&fm=jpg&q=48&bg=ffffff`;
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function styleTableRow(row) {
    row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
            top: { style: "thin", color: { argb: "FFE1E1E1" } },
            left: { style: "thin", color: { argb: "FFE1E1E1" } },
            bottom: { style: "thin", color: { argb: "FFE1E1E1" } },
            right: { style: "thin", color: { argb: "FFE1E1E1" } },
        };
        cell.alignment = {
            vertical: "middle",
            horizontal: cell.col === 3 ? "left" : "center",
            wrapText: true,
        };
    });
}

export async function createOrderExcelFile({
    orderNumber,
    customer,
    selectedStore,
    items,
}) {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Porudžbina", {
        views: [{ state: "frozen", ySplit: 5 }],
    });

    workbook.creator = "Marbok doo";
    workbook.created = new Date();

    worksheet.columns = [
        { key: "image", width: 15 },
        { key: "productKey", width: 18 },
        { key: "name", width: 38 },
        { key: "price", width: 16 },
        { key: "quantity", width: 14 },
        { key: "total", width: 18 },
    ];

    worksheet.mergeCells("A1:F1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "MARBOK – PORUDŽBINA";
    titleCell.font = { bold: true, size: 20, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: BRAND_COLOR },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 34;

    worksheet.mergeCells("A2:F2");
    worksheet.getCell("A2").value = `Broj porudžbine: ${orderNumber}`;
    worksheet.getCell("A2").font = { bold: true, size: 14, color: { argb: BRAND_COLOR } };
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    worksheet.mergeCells("A3:F3");
    worksheet.getCell("A3").value = `Kupac: ${customer.name} | Email: ${customer.email} | Telefon: ${customer.phone}`;
    worksheet.getCell("A3").alignment = { horizontal: "center", wrapText: true };

    worksheet.mergeCells("A4:F4");
    worksheet.getCell("A4").value = selectedStore
        ? `Prodavnica: ${selectedStore.name}${
              selectedStore.pib ? ` | PIB: ${selectedStore.pib}` : ""
          }${selectedStore.pass ? ` | Šifra kupca: ${selectedStore.pass}` : ""}`
        : `Datum: ${new Intl.DateTimeFormat("sr-Latn-RS", {
              dateStyle: "medium",
              timeStyle: "short",
          }).format(new Date())}`;
    worksheet.getCell("A4").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: LIGHT_BRAND_COLOR },
    };
    worksheet.getCell("A4").alignment = { horizontal: "center", wrapText: true };

    const header = worksheet.addRow([
        "SLIKA",
        "ŠIFRA",
        "NAZIV PROIZVODA",
        "CENA",
        "KOLIČINA",
        "IZNOS",
    ]);
    header.height = 26;
    header.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: BRAND_COLOR },
        };
    });
    styleTableRow(header);

    let total = 0;
    const imageTasks = [];

    items.forEach((item) => {
        const price = parsePrice(item.price);
        const quantity = parseInt(item.quantity, 10) || 0;
        const lineTotal = price * quantity;
        total += lineTotal;

        const row = worksheet.addRow([
            "",
            item.productKey || "",
            item.name || "",
            `${formatPrice(price)} RSD`,
            quantity,
            `${formatPrice(lineTotal)} RSD`,
        ]);
        row.height = 78;
        row.getCell(3).font = { bold: true };
        row.getCell(6).font = { bold: true, color: { argb: BRAND_COLOR } };
        styleTableRow(row);

        if (item.image) {
            imageTasks.push(
                imageAsDataUrl(item.image)
                    .then((base64) => {
                        if (!base64) return;
                        const imageId = workbook.addImage({
                            base64,
                            extension: "jpeg",
                        });
                        worksheet.addImage(imageId, {
                            tl: { col: 0.18, row: row.number - 0.88 },
                            ext: { width: 60, height: 60 },
                            editAs: "oneCell",
                        });
                    })
                    .catch(() => {
                        row.getCell(1).value = "Slika nije dostupna";
                    })
            );
        }
    });

    await Promise.all(imageTasks);

    const totalRow = worksheet.addRow(["", "", "", "", "UKUPNO", `${formatPrice(total)} RSD`]);
    totalRow.height = 28;
    totalRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: BRAND_COLOR } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: LIGHT_BRAND_COLOR },
        };
    });
    styleTableRow(totalRow);

    worksheet.autoFilter = "A5:F5";
    worksheet.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return new File([buffer], `MARBOK_Porudzbina_${orderNumber}.xlsx`, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
}
