"use client";
import React, { useState } from "react";
import styles from "./Content.module.css";
import Modal from "@/components/Modal/Modal";
import { urlFromThumbnail } from "@/utils/image";

export const revalidate = 10;

function Content({ pages }) {
  const [modalStates, setModalStates] = useState({});

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
    if (a.title === "Novo") return -1; // 'Novo' comes first
    if (b.title === "Novo") return 1; // 'Novo' comes first
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
              <div key={contentArea?._id} className={styles.productCard}>
                <img
                  src={urlFromThumbnail(contentArea?.image)}
                  alt={contentArea?.name}
                  className={styles.img}
                  onClick={() => toggleModal(contentArea?._id)}
                />
                {contentArea?.package && (
                  <p className={styles.package}>{contentArea?.package}</p>
                )}
                <div className={styles.productInfo}>
                  {contentArea?.name && (
                    <h3 className={styles.productName}>{contentArea?.name}</h3>
                  )}
                  <div className={styles.fieldInfoContainer}>
                    {contentArea?.price && (
                      <div className={styles.fieldInfoWrapper}>
                        <span className={styles.fieldName}>Cena: </span>
                        <span>{contentArea?.price} rsd</span>
                      </div>
                    )}
                    {contentArea?.productKey && (
                      <div className={styles.fieldInfoWrapper}>
                        <span className={styles.fieldName}>
                          Šifra proizvoda:{" "}
                        </span>
                        <span>{contentArea?.productKey}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
