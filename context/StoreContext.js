import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/useAuth";
import { isOwner } from "@/utils/adminAccess";

const StoreContext = createContext();

export function StoreProvider({ children }) {
    const { user, loading } = useAuth();
    const [selectedStore, setSelectedStore] = useState(null);
    const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!isOwner(user)) {
            setSelectedStore(null);
            setIsStoreSelectorOpen(false);
            Cookies.remove("selectedStore");
            return;
        }
        const storedStore = Cookies.get("selectedStore");
        if (storedStore) {
            try {
                setSelectedStore(JSON.parse(storedStore));
            } catch (e) {
                console.error("Error parsing stored store:", e);
            }
        }
    }, [user, loading]);

    const handleStoreSelect = (store) => {
        if (!isOwner(user)) return;
        setSelectedStore(store);
        Cookies.set("selectedStore", JSON.stringify(store), { expires: 7 });
    };

    return (
        <StoreContext.Provider
            value={{
                selectedStore,
                isStoreSelectorOpen,
                setIsStoreSelectorOpen,
                handleStoreSelect,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    return useContext(StoreContext);
}
