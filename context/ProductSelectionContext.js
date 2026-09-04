import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isOwner } from "@/utils/adminAccess";
import { productIdentity, toggleProduct } from "@/utils/productSelection";
import { readSelection, writeSelection, clearStoredSelection } from "@/utils/selectionStorage";

const ProductSelectionContext = createContext(null);
const emptySelection = uid => ({ uid, items: [], active: false });
function sessionStore() {
    try { return window.sessionStorage; } catch { return null; }
}

export function ProductSelectionProvider({ children }) {
    const { user, loading } = useAuth();
    const owner = !loading && isOwner(user);
    const [selection, setSelection] = useState(() => emptySelection(null));
    const current = useRef(selection);

    useEffect(() => {
        // Firebase initially reports an unresolved user on each full-page navigation.
        // Wait for that resolution before reading or clearing the previous selection.
        if (loading) return;
        const storage = sessionStore();
        const restored = owner ? readSelection(storage, user.uid) : emptySelection(null);
        if (!owner) clearStoredSelection(storage);
        current.current = restored;
        setSelection(restored);
    }, [loading, owner, user?.uid]);

    const allowed = owner && selection.uid === user?.uid;
    const update = next => {
        if (!allowed || current.current.uid !== user?.uid) return;
        current.current = next;
        // Persist in the event handler before a category link can reload the document.
        writeSelection(sessionStore(), next);
        setSelection(next);
    };
    const toggle = entry => update({
        ...current.current,
        items: toggleProduct(current.current.items, entry),
    });
    const begin = entry => {
        if (!allowed) return;
        const previous = current.current;
        const id = productIdentity(entry?.product);
        const items = id && !previous.items.some(item => productIdentity(item.product) === id)
            ? [...previous.items, entry] : previous.items;
        update({ ...previous, active: true, items });
    };
    const clear = () => update(emptySelection(user?.uid));
    return <ProductSelectionContext.Provider value={{
        allowed, active: allowed && selection.active, items: allowed ? selection.items : [], begin, toggle, clear,
    }}>{children}</ProductSelectionContext.Provider>;
}
export function useProductSelection() { return useContext(ProductSelectionContext); }
