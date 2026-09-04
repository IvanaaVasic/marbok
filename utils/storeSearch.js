export function normalizeSearch(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("sr-Latn-RS").replace(/đ/g, "dj").trim();
}

export function filterStores(stores, query, field = "all", sort = "asc") {
    const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
    const fields = field === "all"
        ? ["name", "address", "pib", "pass", "phone", "email", "contactPerson"]
        : [field];
    return (stores || []).filter(store => {
        const text = fields.map(key => normalizeSearch(store[key])).join(" ");
        return terms.every(term => text.includes(term));
    }).sort((a, b) => (sort === "desc" ? -1 : 1) *
        String(a.name || "").localeCompare(String(b.name || ""), "sr-Latn", { sensitivity: "base", numeric: true }));
}
