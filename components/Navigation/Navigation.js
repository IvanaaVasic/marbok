"use client";
import clsx from "clsx";
import { useState, useRef } from "react";

import NavModal from "@/components/NavModal/NavModal";
import SvgHamburger from "@/components/SvgHamburger/SvgHamburger";

import styles from "./Navigation.module.css";
import Link from "next/link";
import { useRouter } from "next/router";

export const revalidate = 10;

function Navigation({ pages }) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const pathName = router.pathname;

  const isContactPage = pathName === "/contact";

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

  const handleClick = (e, id) => {
    if (!id) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);

      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
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

      <NavModal ref={navRef} className={styles.dialog} isOpen={isOpen}>
        <nav className={styles.navigationContainer}>
          <ul className={styles.list}>
            <Link href={`/`}>
              <li className={clsx(styles.listItem)}>
                <p className={styles.link}>
                  <p onClick={(e) => handleClick(e, "home")}>Katalog</p>
                </p>
              </li>
            </Link>
            <Link href={`/contact`}>
              <li className={clsx(styles.listItem)}>
                <p className={styles.link}>
                  <p onClick={(e) => handleClick(e, "contact")}>Kontakt</p>
                </p>
              </li>
            </Link>
            <hr className={styles.line} />
            {!isContactPage &&
              pages?.map(({ title, image }) => (
                <li key={title} className={clsx(styles.listItem)}>
                  <a href={`#${title}`} className={styles.link}>
                    {image && (
                      <img
                        src={image}
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
export default Navigation;
