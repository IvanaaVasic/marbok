import ContactForm from "@/components/ContactForm/ContactForm";
import styles from "./Contact.module.css";
import { getPages, getCategories, getStores } from "@/sanity/sanity-utils";
import { usePages, useCategories } from "@/hooks/usePages";
import Layout from "@/components/Layout/Layout";
import { useCart } from "@/hooks/useCart";
import Checkout from "@/components/Checkout/Checkout";
import { useState, useEffect } from "react";
import StoreSelector from "@/components/StoreSelector/StoreSelector";
import Cookies from "js-cookie";

function Contact({ initialPages, initialCategory, initialStores }) {
    const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const pages = usePages() || initialPages;
    const categories = useCategories() || initialCategory;
    const { cart, removeFromCart } = useCart();
    const stores = initialStores;

    // Load selected store from cookie on mount
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
        // Store in cookie with 7 days expiry
        Cookies.set("selectedStore", JSON.stringify(store), { expires: 7 });
    };

    return (
        <Layout pages={pages} categories={categories}>
            {(filteredProducts) => (
                <div className={styles.container}>
                    <button
                        className={styles.storeSelectorButton}
                        onClick={() => setIsStoreSelectorOpen(true)}
                    >
                        {selectedStore
                            ? selectedStore.name
                            : "Izaberi Prodavnicu"}
                    </button>
                    <StoreSelector
                        stores={stores}
                        isOpen={isStoreSelectorOpen}
                        onClose={() => setIsStoreSelectorOpen(false)}
                        onStoreSelect={(store) => {
                            handleStoreSelect(store);
                            setIsStoreSelectorOpen(false);
                        }}
                    />
                    <Checkout cart={cart} removeFromCart={removeFromCart} />
                    <div className={styles.line}></div>
                    <ContactForm selectedStore={selectedStore} />
                </div>
            )}
        </Layout>
    );
}

export async function getServerSideProps({ req }) {
    const initialPages = await getPages();
    const initialCategory = await getCategories();
    const initialStores = await getStores();

    return {
        props: {
            initialPages,
            initialCategory,
            initialStores,
        },
    };
}

export default Contact;
