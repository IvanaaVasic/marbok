import React from "react";
import styles from "./StoreSelector.module.css";
import { IoIosCloseCircle } from "react-icons/io";
import { MdStorefront } from "react-icons/md";

function StoreSelector({ stores, onStoreSelect, isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    <IoIosCloseCircle className={styles.closeIcon} />
                </button>
                <h2 className={styles.title}>Izaberite Prodavnicu</h2>
                <div className={styles.storeList}>
                    {stores?.map((store) => (
                        <button
                            key={store._id}
                            className={styles.storeButton}
                            onClick={() => {
                                onStoreSelect(store);
                                onClose();
                            }}
                        >
                            <MdStorefront className={styles.storeIcon} />
                            <div className={styles.storeInfo}>
                                <h3>{store.name}</h3>
                                <p>{store.address}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StoreSelector;
