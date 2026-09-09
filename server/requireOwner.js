import { isOwner } from "@/utils/adminAccess";
import { requireFirebaseUser } from "@/server/requireFirebaseUser";

// The ID token is validated by Firebase, never by trusting a client-supplied email.
export async function requireOwner(req, res) {
    const user = await requireFirebaseUser(req, res, { invalidStatus: 403 });
    if (!user) return false;
    if (!isOwner(user)) {
        res.status(403).json({ error: "Ova opcija je dostupna samo vlasniku naloga." });
        return false;
    }
    return true;
}
