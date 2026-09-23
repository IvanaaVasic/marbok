import Link from "next/link";
import Layout from "@/components/Layout/Layout";
import { getCategories, getPages, getStores } from "@/sanity/sanity-utils";
import { useCategories, usePages } from "@/hooks/usePages";
import styles from "./Catalog.module.css";

function Catalog({ initialPages, initialCategory, initialStores }) {
    const pages = usePages() || initialPages;
    const categories = useCategories() || initialCategory;

    return (
        <Layout pages={pages} categories={categories} stores={initialStores}>
            {() => (
                <main className={styles.page}>
                    <header className={styles.header}>
                        <span className={styles.eyebrow}>Za poslovne kupce</span>
                        <h1>Katalog proizvoda</h1>
                        <p>
                            Izaberite kategoriju i odmah pregledajte proizvode,
                            pakovanja i dostupne cene.
                        </p>
                    </header>

                    <nav className={styles.categoryList} aria-label="Kategorije proizvoda">
                        {categories?.map((category) => {
                            const slug = category?.slug?.current || category?.slug;
                            const sections = category?.categoryProducts || [];
                            const productCount = sections.reduce(
                                (total, section) =>
                                    total + (section?.contentArea?.length || 0),
                                0
                            );
                            const sectionNames = sections
                                .map((section) => section?.title)
                                .filter(Boolean)
                                .slice(0, 4)
                                .join(" · ");

                            if (!slug) return null;

                            return (
                                <Link
                                    href={`/category/${slug}`}
                                    className={styles.categoryRow}
                                    key={slug}
                                >
                                    <div>
                                        <h2>{category?.title}</h2>
                                        {sectionNames && (
                                            <p className={styles.sections}>{sectionNames}</p>
                                        )}
                                        <span className={styles.count}>
                                            {productCount} proizvoda
                                        </span>
                                    </div>
                                    <span className={styles.arrow} aria-hidden="true">
                                        →
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {!categories?.length && (
                        <p className={styles.empty}>Katalog trenutno nije dostupan.</p>
                    )}
                </main>
            )}
        </Layout>
    );
}

export default Catalog;

export async function getServerSideProps() {
    const [initialPages, initialCategory, initialStores] = await Promise.all([
        getPages(),
        getCategories(),
        getStores(),
    ]);

    return {
        props: {
            initialPages,
            initialCategory,
            initialStores,
        },
    };
}
