import React, { useState } from "react";
import styles from "./Content.module.css";
import Modal from "@/components/Modal/Modal";
import { useForm } from "react-hook-form";
import { useCart } from "@/hooks/useCart";
import ContentArea from "@/components/ContentArea/ContentArea";

export const revalidate = 10;

function Content({ filteredProducts = [], searchQuery = "", categories }) {
    const [modalStates, setModalStates] = useState({});
    const { addToCart } = useCart();
    const methods = useForm();
    const isSearchActive = searchQuery.trim().length > 0;

    const toggleModal = (pageId) => {
        setModalStates((prevState) => ({
            ...prevState,
            [pageId]: !prevState[pageId],
        }));
    };

    if (!categories || !categories.categoryProducts.length) {
        return <div>Nema proizvoda!</div>;
    }

    const sortedCategories = [...categories.categoryProducts].sort((a, b) => {
        if (a.title === "Novi proizvodi" && b.title !== "Novi proizvodi")
            return -1;
        if (b.title === "Novi proizvodi" && a.title !== "Novi proizvodi")
            return 1;
        return 0;
    });

    return (
        <div>
            <div className={styles.categoryIntro}>
                <div className={styles.lineHeader}></div>
                <h2
                    className={styles.categorySectionHeader}
                    id={categories?.title}
                >
                    {categories?.title}
                </h2>
            </div>

            {!isSearchActive &&
                sortedCategories.map((page) => (
                    <div key={page?._id} className={styles.productBlock}>
                        {page?.image && (
                            <img
                                src={page?.image}
                                alt={page?.title}
                                className={styles.heroImage}
                            />
                        )}
                        <h2
                            className={styles.productSectionHeader}
                            id={page?.title}
                        >
                            {page?.title}
                        </h2>
                        <div className={styles.contentContainer}>
                            {page?.contentArea?.map((contentArea) => (
                                <>
                                    <ContentArea
                                        key={contentArea?._id}
                                        contentArea={contentArea}
                                        addToCart={addToCart}
                                        methods={methods}
                                        toggleModal={toggleModal}
                                    />
                                    <Modal
                                        key={contentArea?._id}
                                        isOpen={modalStates[contentArea?._id]}
                                        onClose={() =>
                                            toggleModal(contentArea?._id)
                                        }
                                        images={[
                                            contentArea?.image,
                                            ...(contentArea?.blockProductImages
                                                ?.productImages || []),
                                        ]}
                                    />
                                </>
                            ))}
                        </div>
                    </div>
                ))}
            {isSearchActive && (
                <section className={styles.searchResults}>
                    <div className={styles.searchResultsHeader}>
                        <h2>Rezultati pretrage</h2>
                        <p>
                            {filteredProducts.length
                                ? `Pronađeno proizvoda: ${filteredProducts.length}`
                                : `Nema proizvoda za „${searchQuery}“`}
                        </p>
                    </div>
                    {filteredProducts.length > 0 ? (
                        <div className={styles.contentContainer}>
                            {filteredProducts.map((filteredcontentArea) => (
                                <React.Fragment key={filteredcontentArea?._id}>
                            <ContentArea
                                contentArea={filteredcontentArea}
                                addToCart={addToCart}
                                methods={methods}
                                toggleModal={toggleModal}
                            />
                                    <Modal
                                        isOpen={modalStates[filteredcontentArea?._id]}
                                        onClose={() =>
                                            toggleModal(filteredcontentArea?._id)
                                        }
                                        images={[
                                            filteredcontentArea?.image,
                                            ...(filteredcontentArea?.blockProductImages
                                                ?.productImages || []),
                                        ]}
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noResults}>
                            <span aria-hidden="true">⌕</span>
                            <strong>Proverite naziv ili šifru proizvoda</strong>
                            <p>
                                Obrišite tekst iz pretrage da ponovo vidite ceo katalog.
                            </p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

export default Content;

export function getStaticProps() {
    return { props: {}, revalidate: 10 };
}
