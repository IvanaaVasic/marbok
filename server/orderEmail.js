export function buildOrderEmailParams(order, { orderUrl = "", orderExcelUrl = "" } = {}) {
    const products = (order?.items || [])
        .map(
            (item) =>
                `proizvod: ${item.name || ""}, kolicina: ${item.quantity || ""}, šifra: ${item.productKey || ""}, cena: ${item.price || ""}`
        )
        .join("\n");
    const excelLine = orderExcelUrl
        ? `\n\nExcel porudžbina (preuzimanje): ${orderExcelUrl}`
        : "";

    return {
        companyName: order?.companyName || "",
        pib: order?.pib || "",
        firstName: order?.customerName || "",
        email: order?.email || "",
        phone: order?.phone || "",
        orderNumber: order?.orderNumber || "",
        orderExcelUrl,
        message: `Firma: ${order?.companyName || ""}\nPIB: ${order?.pib || ""}\nKontakt osoba: ${order?.customerName || ""}\n\n${order?.message || ""}\n\nLink ka potvrdi porudžbine: ${orderUrl}${excelLine}\n\nProizvodi:\n${products}`,
    };
}
