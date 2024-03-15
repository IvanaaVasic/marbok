import ContactForm from "@/components/ContactForm/ContactForm";
import styles from "./Contact.module.css";
import { getPages } from "@/sanity/sanity-utils";
import { usePages } from "@/hooks/usePages";
import Layout from "@/components/Layout/Layout";
import { useCart } from "@/hooks/useCart";
import Checkout from "@/components/Checkout/Checkout";

function Contact({ initialPages }) {
  const pages = usePages() || initialPages;
  const { cart, removeFromCart } = useCart();

  return (
    <Layout pages={pages}>
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
  return {
    props: { initialPages },
  };
}
