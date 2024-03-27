import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper";
import ContentArea from "@/components/ContentArea/ContentArea";
import styles from "./ProductsView.module.css";
import gridStyles from "@/components/Content/Content.module.css";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import Modal from "@/components/Modal/Modal";
import { useCart } from "@/hooks/useCart";
import { useForm } from "react-hook-form";

function ProductsView({ products }) {
  const [modalStates, setModalStates] = useState({});
  const { addToCart } = useCart();
  const methods = useForm();

  const toggleModal = (pageId) => {
    setModalStates((prevState) => ({
      ...prevState,
      [pageId]: !prevState[pageId],
    }));
  };

  const isLg = useMediaQuery(1279);
  const isMd = useMediaQuery(767);

  let gridPreviewThreeCards;
  let gridPreviewTwoCards;
  let gridPreviewOneCard;

  if (products?.contentArea?.length === 3) {
    gridPreviewThreeCards = true;
  } else if (products?.contentArea?.length === 2) {
    gridPreviewTwoCards = true;
  } else if (products?.contentArea?.length === 1) {
    gridPreviewOneCard = true;
  }

  return (
    <>
      <h2 className={styles.productViewHeading}>- {products?.title} -</h2>
      {(gridPreviewThreeCards && !isLg) ||
      (gridPreviewTwoCards && !isMd) ||
      gridPreviewOneCard ? (
        <div className={gridStyles.contentContainer}>
          {products?.contentArea?.map((contentArea) => {
            return (
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
                  onClose={() => toggleModal(contentArea?._id)}
                  images={[
                    contentArea?.image,
                    ...(contentArea?.blockProductImages?.productImages || []),
                  ]}
                />
              </>
            );
          })}
        </div>
      ) : (
        <Swiper
          slidesPerView={3.75}
          breakpoints={{
            1658: {
              slidesPerView: 3.5,
              spaceBetween: 40,
            },
            1440: {
              slidesPerView: 3.5,
              spaceBetween: 30,
            },
            1120: {
              slidesPerView: 3.5,
              spaceBetween: 30,
            },
            1020: {
              slidesPerView: 2.8,
              spaceBetween: 30,
            },
            960: {
              slidesPerView: 2.5,
              spaceBetween: 25,
            },
            768: {
              slidesPerView: 2.3,
            },
            600: {
              slidesPerView: 1.75,
            },
            425: {
              slidesPerView: 1.3,
            },
            280: {
              slidesPerView: 1.2,
            },
          }}
          spaceBetween={10}
          pagination={{
            clickable: true,
          }}
          navigation
          modules={[Pagination, Navigation]}
          className={`${styles.swiper} productCardSwiper`}
        >
          {products?.contentArea?.map((contentAreaSwipper) => {
            return (
              <SwiperSlide
                key={contentAreaSwipper._id}
                className={styles.swiperSlide}
              >
                <ContentArea
                  key={contentAreaSwipper?._id}
                  contentArea={contentAreaSwipper}
                  addToCart={addToCart}
                  methods={methods}
                  toggleModal={toggleModal}
                  className={styles.productCardSwiper}
                  imageClassName={styles.productImageSwiper}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
      {products?.contentArea?.map((contentAreaSwipper) => {
        return (
          <Modal
            key={contentAreaSwipper?._id}
            isOpen={modalStates[contentAreaSwipper?._id]}
            onClose={() => toggleModal(contentAreaSwipper?._id)}
            images={[
              contentAreaSwipper?.image,
              ...(contentAreaSwipper?.blockProductImages?.productImages || []),
            ]}
          />
        );
      })}
    </>
  );
}

export default ProductsView;
