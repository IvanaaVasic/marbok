const normalized = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sr-Latn-RS").trim().replace(/\s+/g, " ");
export function productVariantKey(product) {
    return JSON.stringify([normalized(product?.productKey), normalized(product?.name)]);
}
export function sameCartProduct(left, right) {
    if (left?.productId && right?.productId) return left.productId === right.productId;
    return Boolean(left?.productKey && right?.productKey && left?.name && right?.name)
        && productVariantKey(left) === productVariantKey(right);
}
