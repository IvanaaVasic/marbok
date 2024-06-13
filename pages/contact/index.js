import ContactForm from "@/components/ContactForm/ContactForm";
import styles from "./Contact.module.css";
import { getPages, getCategories } from "@/sanity/sanity-utils";
import { usePages, useCategories } from "@/hooks/usePages";
import Layout from "@/components/Layout/Layout";
import { useCart } from "@/hooks/useCart";
import Checkout from "@/components/Checkout/Checkout";

function Contact({ initialPages, initialCategory }) {
    const pages = usePages() || initialPages;
    const categories = useCategories() || initialCategory;
    const { cart, removeFromCart } = useCart();

    return (
        <Layout pages={pages} categories={categories}>
            {(filteredProducts) => (
                <div className={styles.container}>
                    <Checkout cart={cart} removeFromCart={removeFromCart} />
                    <div className={styles.line}></div>
                    <ContactForm />
                </div>
            )}
        </Layout>
    );
}

export default Contact;

export async function getServerSideProps() {
    const initialPages = await getPages();
    const initialCategory = await getCategories();
    return {
        props: { initialPages, initialCategory },
    };
}
