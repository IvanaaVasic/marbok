import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Autoplay } from "swiper";

import styles from "./BrandSlider.module.css";
import gridStyles from "@/components/Content/Content.module.css";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { urlFromThumbnail } from "@/utils/image";

function BrandSlider({ brandImages }) {
  const isLg = useMediaQuery(1279);
  const isMd = useMediaQuery(767);

  let gridPreviewThreeCards;
  let gridPreviewTwoCards;
  let gridPreviewOneCard;

  if (brandImages?.length === 3) {
    gridPreviewThreeCards = true;
  } else if (brandImages?.length === 2) {
    gridPreviewTwoCards = true;
  } else if (brandImages?.length === 1) {
    gridPreviewOneCard = true;
  }

  return (
    <div className={styles.brandContainer}>
      <h2 className={styles.brandHeading}>- MARBOK Partneri -</h2>
      {(gridPreviewThreeCards && !isLg) ||
      (gridPreviewTwoCards && !isMd) ||
      gridPreviewOneCard ? (
        <div className={gridStyles.contentContainer}>
          {brandImages?.map(({ image, _id }) => {
            return (
              <img
                key={_id}
                src={urlFromThumbnail(image)}
                alt="brand image"
                className={styles.brandImage}
              />
            );
          })}
        </div>
      ) : (
        <Swiper
          slidesPerView={3.75}
          breakpoints={{
            1658: {
              slidesPerView: 4.5,
              spaceBetween: 40,
            },
            1440: {
              slidesPerView: 4.5,
              spaceBetween: 30,
            },
            1120: {
              slidesPerView: 3.5,
              spaceBetween: 30,
            },
            1020: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            960: {
              slidesPerView: 2.6,
              spaceBetween: 25,
            },
            768: {
              slidesPerView: 2.5,
            },
            600: {
              slidesPerView: 1.75,
            },
            425: {
              slidesPerView: 1.7,
            },
            280: {
              slidesPerView: 1.5,
            },
          }}
          spaceBetween={10}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          navigation
          modules={[Pagination, Autoplay]}
          className={`${styles.swiper} brandSwiper`}
        >
          {brandImages.map(({ image, _id }) => {
            return (
              <SwiperSlide key={_id} className={styles.swiperSlide}>
                <img
                  key={_id}
                  src={urlFromThumbnail(image)}
                  alt="brand image"
                  className={styles.brandImage}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </div>
  );
}

export default BrandSlider;
