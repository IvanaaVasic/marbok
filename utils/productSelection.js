export function productIdentity(product) {
    return product?._id || product?.productKey || null;
}

export function toggleProduct(items, entry) {
    const id = productIdentity(entry?.product);
    if (!id) return items;
    if (items.some(item => productIdentity(item.product) === id)) {
        return items.filter(item => productIdentity(item.product) !== id);
    }
    return [...items, entry];
}

export function selectedCategories(items) {
    const categories = new Map();
    for (const { product, categoryTitle = "Proizvodi", groupTitle = "Izabrani proizvodi" } of items) {
        if (!categories.has(categoryTitle)) categories.set(categoryTitle, new Map());
        const groups = categories.get(categoryTitle);
        if (!groups.has(groupTitle)) groups.set(groupTitle, []);
        groups.get(groupTitle).push(product);
    }
    return [...categories].map(([title, groups]) => ({
        title, categoryProducts: [...groups].map(([title, contentArea]) => ({ title, contentArea })),
    }));
}

// Cancels a hold when the user scrolls; the following click is consumed only after a hold.
export function createProductHold(onHold, { schedule = setTimeout, cancel = clearTimeout, delay = 450 } = {}) {
    let timer = null, start = null, held = false;
    const stop = () => { if (timer !== null) cancel(timer); timer = null; };
    return {
        down(event) {
            stop(); held = false;
            if (event.isPrimary === false || (event.pointerType === "mouse" && event.button !== 0)) return;
            start = { x: event.clientX, y: event.clientY };
            timer = schedule(() => { timer = null; held = true; onHold(); }, delay);
        },
        move(event) {
            if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) { stop(); start = null; }
        },
        end() { stop(); start = null; },
        consumeClick() { const result = held; held = false; return result; },
        dispose() { stop(); start = null; held = false; },
    };
}
