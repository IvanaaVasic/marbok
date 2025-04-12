import ContactForm from "@/components/ContactForm/ContactForm";
import styles from "./Contact.module.css";
import { getPages, getCategories, getStores } from "@/sanity/sanity-utils";
import { usePages, useCategories } from "@/hooks/usePages";
import Layout from "@/components/Layout/Layout";
import { useCart } from "@/hooks/useCart";
import Checkout from "@/components/Checkout/Checkout";

import { useStore } from "@/context/StoreContext";

function Contact({ initialPages, initialCategory, initialStores }) {
    const pages = usePages() || initialPages;
    const categories = useCategories() || initialCategory;
    const { cart, removeFromCart } = useCart();
    const { selectedStore } = useStore();

    return (
        <Layout pages={pages} categories={categories} stores={initialStores}>
            {(filteredProducts) => (
                <div className={styles.container}>
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
