import React from "react";
import styles from "./Modal.module.css";
import { IoIosCloseCircle } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import { urlFromThumbnail } from "@/utils/image";
import SwiperCore, {
  Navigation,
  Pagination,
  Mousewheel,
  Keyboard,
} from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// import required modules

SwiperCore.use([Navigation, Pagination, Mousewheel, Keyboard]);

function Modal({ isOpen, onClose, images }) {
  if (!isOpen) {
    return null;
  }

  const restOfImages = images.slice(1);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <IoIosCloseCircle className={styles.closeIcon} />
        </button>
        <Swiper
          cssMode={true}
          navigation={true}
          pagination={true}
          mousewheel={true}
          keyboard={true}
          className={`modal ${styles.imagesSwiper}`}
        >
          <SwiperSlide>
            <img
              src={urlFromThumbnail(images[0])}
              alt={images[0]?.name}
              className={styles.productImage}
            />
          </SwiperSlide>
          {restOfImages.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={urlFromThumbnail(image?.image)}
                alt={image?.name}
                className={styles.productImage}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default Modal;
