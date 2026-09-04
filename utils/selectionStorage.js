const KEY = "marbok-product-selection-v1";
const empty = uid => ({ uid, active: false, items: [] });

export function readSelection(storage, uid) {
    if (!uid) return empty(null);
    try {
        const saved = JSON.parse(storage.getItem(KEY) || "null");
        if (saved?.uid !== uid || !Array.isArray(saved.items)) return empty(uid);
        const seen = new Set();
        const items = saved.items.filter(entry => {
            const id = entry?.product?._id || entry?.product?.productKey;
            if ((typeof id !== "string" && typeof id !== "number") || seen.has(String(id))) return false;
            seen.add(String(id));
            return true;
        });
        return { uid, active: Boolean(saved.active || items.length), items };
    } catch { return empty(uid); }
}

export function writeSelection(storage, selection) {
    try {
        if (!selection.uid || (!selection.active && !selection.items.length)) storage.removeItem(KEY);
        else storage.setItem(KEY, JSON.stringify(selection));
        return true;
    } catch { return false; }
}

export function clearStoredSelection(storage) {
    try { storage.removeItem(KEY); } catch { /* Memory selection remains usable. */ }
}
