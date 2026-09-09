import { isOwner } from "@/utils/adminAccess";

// Nalozi napravljeni pre uvođenja odobravanja ostaju automatski odobreni.
export const APPROVAL_ROLLOUT_MS = Date.parse("2026-09-09T00:00:00.000Z");

export async function resolveAccountAccess(client, firebaseUser) {
    if (isOwner(firebaseUser)) return { status: "approved", request: null };

    const email = String(firebaseUser.email || "").trim().toLowerCase();
    const request = await client.fetch(
        `*[_type == "store" && (firebaseUid == $uid || lower(email) == $email)] | order(_updatedAt desc)[0]{
            _id, name, email, approvalStatus, registeredAt
        }`,
        { uid: firebaseUser.localId, email }
    );

    if (request?.approvalStatus) return { status: request.approvalStatus, request };
    if (request) return { status: "approved", request };

    const createdAt = Number(firebaseUser.createdAt || 0);
    if (createdAt && createdAt < APPROVAL_ROLLOUT_MS) {
        return { status: "approved", request: null };
    }
    return { status: "pending", request: null };
}
