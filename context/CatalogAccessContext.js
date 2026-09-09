import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const CatalogAccessContext = createContext({
    status: "guest",
    prices: {},
    canSeePrices: false,
    loading: false,
});

export function CatalogAccessProvider({ children }) {
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState("guest");
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        if (authLoading) return;
        if (!user) {
            setStatus("guest");
            setPrices({});
            setLoading(false);
            return;
        }

        setLoading(true);
        user.getIdToken()
            .then((token) => fetch("/api/access/catalog", {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            }))
            .then(async (response) => {
                const body = await response.json();
                if (!response.ok) throw new Error(body.error || "Provera pristupa nije uspela.");
                if (!active) return;
                setStatus(body.status || "pending");
                setPrices(body.prices || {});
            })
            .catch(() => {
                if (!active) return;
                setStatus("error");
                setPrices({});
            })
            .finally(() => active && setLoading(false));

        return () => { active = false; };
    }, [user, authLoading]);

    const value = useMemo(() => ({
        status,
        prices,
        canSeePrices: status === "approved",
        loading: authLoading || loading,
    }), [status, prices, authLoading, loading]);

    return <CatalogAccessContext.Provider value={value}>{children}</CatalogAccessContext.Provider>;
}

export function useCatalogAccess() {
    return useContext(CatalogAccessContext);
}
