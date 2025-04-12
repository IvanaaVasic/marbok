import Layout from "@/components/Layout/Layout";
import styles from "./Authentication.module.css";
import Button from "@/components/Button/Button";
import { getPages, getCategories, getStores } from "@/sanity/sanity-utils";
import { usePages, useCategories } from "@/hooks/usePages";

function Authentication({ initialPages, initialCategory, initialStores }) {
    const pages = usePages() || initialPages;
    const categories = useCategories() || initialCategory;
    return (
        <Layout pages={pages} categories={categories} stores={initialStores}>
            {(filteredProducts) => (
                <div className={styles.container}>
                    <div className={styles.contentBoxesContainer}>
                        <div className={styles.contentContainer}>
                            <div className={styles.contentWrapper}>
                                <Button
                                    theme="primary"
                                    content="Kreiraj nalog"
                                    size="regular"
                                    href={"/auth/signup"}
                                />
                                <p className={styles.containerText}>
                                    Ukoliko još uvek nemaš, kreiraj svoj nalog!
                                </p>
                            </div>
                        </div>
                        <div className={styles.contentContainer}>
                            <div className={styles.contentWrapper}>
                                <Button
                                    theme="primary"
                                    content="Prijavi se"
                                    size="regular"
                                    href={"auth/login"}
                                />

                                <p className={styles.containerText}>
                                    Ukoliko već imaš otvoren nalog, prijavi se!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
export default Authentication;
export async function getServerSideProps() {
    const initialPages = await getPages();
    const initialCategory = await getCategories();
    const initialStores = await getStores();

    return {
        props: { initialPages, initialCategory, initialStores },
    };
}
