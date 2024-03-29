"use client";
import clsx from "clsx";
import { useState, useRef } from "react";

import NavModal from "@/components/NavModal/NavModal";
import SvgHamburger from "@/components/SvgHamburger/SvgHamburger";

import styles from "./NavigationMobile.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { HiHome } from "react-icons/hi2";
import { GrCatalog } from "react-icons/gr";
import { MdContactMail } from "react-icons/md";
import { BsFillPeopleFill } from "react-icons/bs";

export const revalidate = 10;

function NavigationMobile({ pages }) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const pathName = router.pathname;

  const isCatalogPage = pathName === "/catalog";

  const isMd = useMediaQuery(1000);

  const navRef = useRef(null);

  const handleHrefClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className={styles.nav}>
        <SvgHamburger
          isActive={isOpen}
          className={styles.hamburger}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        />
      </div>
      <NavModal
        ref={navRef}
        isOpen={isOpen}
        className={clsx(styles.dialog, { [styles.open]: isOpen })}
      >
        <div className={styles.modalOverlay}></div>

        <nav className={styles.navigationContainer}>
          <ul className={styles.list}>
            {((!isCatalogPage && !isMd) || isMd) && (
              <>
                <Link href={`/`}>
                  <li className={clsx(styles.listItem)}>
                    <HiHome />
                    <p className={styles.link}>Naslovna</p>
                  </li>
                </Link>
                <Link href={`/catalog`}>
                  <li className={clsx(styles.listItem)}>
                    <GrCatalog />
                    <p className={styles.link}>Katalog proizvoda</p>
                  </li>
                </Link>
                <Link href={`/aboutus`}>
                  <li className={clsx(styles.listItem)}>
                    <BsFillPeopleFill />
                    <p className={styles.link}>O nama</p>
                  </li>
                </Link>
                <Link href={`/contact`}>
                  <li className={clsx(styles.listItem)}>
                    <MdContactMail />
                    <p className={styles.link}>Kontakt</p>
                  </li>
                </Link>
                <hr className={styles.line} />
              </>
            )}
            {isCatalogPage &&
              pages?.map(({ title, image }) => (
                <li key={title} className={clsx(styles.listItem)}>
                  <a href={`#${title}`} className={styles.link}>
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className={styles.sideBarImage}
                        onClick={(e) => handleHrefClick(e, title)}
                      />
                    ) : (
                      <img
                        src={"/images/generic.png"}
                        alt={title}
                        className={styles.sideBarImage}
                        onClick={(e) => handleHrefClick(e, title)}
                      />
                    )}
                    {title && (
                      <p onClick={(e) => handleHrefClick(e, title)}> {title}</p>
                    )}
                  </a>
                </li>
              ))}
          </ul>
        </nav>
      </NavModal>
    </>
  );
}
export default NavigationMobile;
