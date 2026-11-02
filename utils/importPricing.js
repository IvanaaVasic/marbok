// Price uplift is applied once to the imported base price, on the server.
export function importPricing(price, markup) {
    const original = String(price ?? "").trim().replace(/\s*RSD\s*$/i, "");
    const raw = String(markup ?? "").trim();
    if (!raw) return { price: original, markup: null, error: "" };
    let rate = Number(raw.replace(/%$/, "").trim().replace(",", "."));
    if (!raw.includes("%") && rate > 0 && rate < 1) rate *= 100;
    rate = Math.round(rate * 1e8) / 1e8;
    if (!Number.isInteger(rate) || rate < 5 || rate > 75)
        return { error: "Marža mora biti ceo procenat od 5 do 75%." };
    let amount = original.replace(/\s/g, "");
    if (amount.includes(",") && amount.includes(".")) {
        amount = amount.lastIndexOf(",") > amount.lastIndexOf(".")
            ? amount.replace(/\./g, "").replace(",", ".")
            : amount.replace(/,/g, "");
    } else amount = amount.replace(",", ".");
    if (!/^\d+(?:\.\d+)?$/.test(amount) || !Number.isFinite(Number(amount)))
        return { error: "Za maržu unesi ispravnu osnovnu cenu (npr. 100 ili 100,50)." };
    const final = Math.round((Number(amount) * (1 + rate / 100) + Number.EPSILON) * 100) / 100;
    if (!Number.isFinite(final)) return { error: "Cena je prevelika." };
    return { price: final.toFixed(2), markup: rate, error: "" };
}
