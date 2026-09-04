import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isOwner } from "@/utils/adminAccess";
import { productIdentity, toggleProduct } from "@/utils/productSelection";

const ProductSelectionContext = createContext(null);
export function ProductSelectionProvider({ children }) {
    const { user, loading } = useAuth();
    const allowed = !loading && isOwner(user);
    const [items, setItems] = useState([]);
    const [active, setActive] = useState(false);
    useEffect(() => { setItems([]); setActive(false); }, [user?.uid]);
    const toggle = entry => { if (allowed) setItems(current => toggleProduct(current, entry)); };
    const begin = entry => {
        if (!allowed) return;
        setActive(true);
        if (entry && productIdentity(entry.product)) setItems(current =>
            current.some(item => productIdentity(item.product) === productIdentity(entry.product)) ? current : [...current, entry]);
    };
    const clear = () => { setItems([]); setActive(false); };
    return <ProductSelectionContext.Provider value={{
        allowed, active: allowed && active, items: allowed ? items : [], begin, toggle, clear,
    }}>{children}</ProductSelectionContext.Provider>;
}
export function useProductSelection() { return useContext(ProductSelectionContext); }
