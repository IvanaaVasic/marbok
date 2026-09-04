import { firebaseConfig } from "@/config/firebasePublic";
import { isOwner } from "@/utils/adminAccess";

// The ID token is validated by Firebase, never by trusting a client-supplied email.
export async function requireOwner(req, res) {
    res.setHeader("Cache-Control", "private, no-store");
    const match = /^Bearer (\S+)$/.exec(req.headers.authorization || "");
    if (!match) {
        res.status(401).json({ error: "Prijavi se ponovo da nastaviš." });
        return false;
    }
    try {
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: match[1] }), signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
            res.status(response.status >= 500 || response.status === 429 ? 503 : 401)
                .json({ error: response.status >= 500 || response.status === 429
                    ? "Provera prijave trenutno nije dostupna. Pokušaj ponovo."
                    : "Prijava je istekla. Prijavi se ponovo." });
            return false;
        }
        const { users } = await response.json();
        if (!users?.[0]?.localId || users[0].disabled || !isOwner(users[0])) {
            res.status(403).json({ error: "Ova opcija je dostupna samo vlasniku naloga." });
            return false;
        }
        return true;
    } catch {
        res.status(503).json({ error: "Provera prijave trenutno nije dostupna. Pokušaj ponovo." });
        return false;
    }
}
