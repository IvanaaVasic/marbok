import React, { useState, useMemo } from "react";
import styles from "./StoreSelector.module.css";
import { IoClose } from "react-icons/io5";
import { MdStorefront, MdSearch } from "react-icons/md";

function StoreSelector({ stores, isOpen, onClose, onStoreSelect }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStores = useMemo(() => {
        return stores?.filter(
            (store) =>
                store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                store.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [stores, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h2>Izaberi Prodavnicu</h2>
                    <IoClose className={styles.closeIcon} onClick={onClose} />
                </div>
                <div className={styles.searchContainer}>
                    <MdSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Pretraži prodavnice..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.storeList}>
                    {filteredStores?.map((store) => (
                        <button
                            key={store._id}
                            className={styles.storeItem}
                            onClick={() => onStoreSelect(store)}
                        >
                            <MdStorefront className={styles.storeIcon} />
                            <div className={styles.storeInfo}>
                                <h3>{store.name}</h3>
                                <p>{store.address}</p>
                            </div>
                        </button>
                    ))}
                    {filteredStores?.length === 0 && (
                        <p className={styles.noResults}>
                            Nema rezultata pretrage
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StoreSelector;
