import { isOwner } from "@/utils/adminAccess";

export function canReadOrder(user, order) {
    if (!user || !order) return false;
    if (isOwner(user)) return true;
    if (order.firebaseUid) return order.firebaseUid === user.localId;
    // Legacy orders lack a UID; only the verified Firebase email may read them.
    return Boolean(user.email && order.email && user.email.toLowerCase() === order.email.toLowerCase());
}
