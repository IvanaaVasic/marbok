import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const StoreContext = createContext();

export function StoreProvider({ children }) {
    const [selectedStore, setSelectedStore] = useState(null);
    const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);

    useEffect(() => {
        const storedStore = Cookies.get("selectedStore");
        if (storedStore) {
            try {
                setSelectedStore(JSON.parse(storedStore));
            } catch (e) {
                console.error("Error parsing stored store:", e);
            }
        }
    }, []);

    const handleStoreSelect = (store) => {
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
