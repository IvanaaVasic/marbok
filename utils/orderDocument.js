export function parseOrderPrice(value) {
    const normalized = String(value ?? "").replace(/\s/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    return Number.parseFloat(normalized) || 0;
}
export function formatOrderPrice(value) {
    return new Intl.NumberFormat("sr-Latn-RS", { maximumFractionDigits: 2 }).format(value);
}
export function orderItems(order) {
    return (order?.items || []).map(item => ({
        ...item,
        name: item.name || item.productDetails?.name || "Proizvod bez naziva",
        productKey: item.productKey || item.productDetails?.productKey || "",
        image: item.image || item.productDetails?.image || null,
        package: item.package || item.productDetails?.package || "",
    }));
}
export function orderTotal(order) {
    return orderItems(order).reduce((sum, item) => sum + parseOrderPrice(item.price) * (parseInt(item.quantity, 10) || 0), 0);
}
