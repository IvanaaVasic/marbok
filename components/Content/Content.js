import React, { useState } from "react";
import styles from "./Content.module.css";
import Modal from "@/components/Modal/Modal";
import { useForm } from "react-hook-form";
import { useCart } from "@/hooks/useCart";
import ContentArea from "@/components/ContentArea/ContentArea";

export const revalidate = 10;

function Content({ pages }) {
  const [modalStates, setModalStates] = useState({});
  const { addToCart } = useCart();
  const methods = useForm();

  const toggleModal = (pageId) => {
    setModalStates((prevState) => ({
      ...prevState,
      [pageId]: !prevState[pageId],
    }));
  };

  if (!pages || !pages.content) {
    return <div>No content available</div>;
  }

  const sortedPages = [...pages.content].sort((a, b) => {
    if (a.title === "Novo" && b.title !== "Novo") return -1;
    if (b.title === "Novo" && a.title !== "Novo") return 1;
    return 0;
  });

  return (
    <div>
      {sortedPages.map((page) => (
        <div key={page?._id} className={styles.productBlock}>
          {page?.image && (
            <img
              src={page?.image}
              alt={page?.title}
              className={styles.heroImage}
            />
          )}
          <h2 className={styles.productSectionHeader} id={page?.title}>
            {page?.title}
          </h2>
          <div className={styles.contentContainer}>
            {page?.contentArea?.map((contentArea) => (
              <ContentArea
                key={contentArea?._id}
                contentArea={contentArea}
                addToCart={addToCart}
                methods={methods}
                toggleModal={toggleModal}
              />
            ))}
          </div>
          {page?.contentArea?.map((contentArea) => (
            <Modal
              key={contentArea?._id}
              isOpen={modalStates[contentArea?._id]}
              onClose={() => toggleModal(contentArea?._id)}
              images={[
                contentArea?.image,
                ...(contentArea?.blockProductImages?.productImages || []),
              ]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Content;

export function getStaticProps() {
  return { props: {}, revalidate: 10 };
}
