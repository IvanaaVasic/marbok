import React from "react";
import styles from "./StoreSelector.module.css";
import { IoClose } from "react-icons/io5";

function StoreSelector({ stores, isOpen, onClose, onStoreSelect }) {
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
                <div className={styles.storeList}>
                    {stores?.map((store) => (
                        <button
                            key={store._id}
                            className={styles.storeItem}
                            onClick={() => onStoreSelect(store)}
                        >
                            {store.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StoreSelector;
