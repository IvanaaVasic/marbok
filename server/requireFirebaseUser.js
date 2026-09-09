import { firebaseConfig } from "@/config/firebasePublic";

export async function requireFirebaseUser(req, res, { invalidStatus = 401 } = {}) {
    res.setHeader("Cache-Control", "private, no-store");
    const match = /^Bearer (\S+)$/.exec(req.headers.authorization || "");
    if (!match) {
        res.status(401).json({ error: "Prijavi se ponovo da nastaviš." });
        return null;
    }

    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: match[1] }),
                signal: AbortSignal.timeout(10000),
            }
        );
        if (!response.ok) {
            res.status(response.status >= 500 || response.status === 429 ? 503 : 401).json({
                error:
                    response.status >= 500 || response.status === 429
                        ? "Provera prijave trenutno nije dostupna. Pokušaj ponovo."
                        : "Prijava je istekla. Prijavi se ponovo.",
            });
            return null;
        }

        const { users } = await response.json();
        const user = users?.[0];
        if (!user?.localId || user.disabled) {
            res.status(invalidStatus).json({ error: "Prijava nije važeća." });
            return null;
        }
        return user;
    } catch {
        res.status(503).json({ error: "Provera prijave trenutno nije dostupna. Pokušaj ponovo." });
        return null;
    }
}
