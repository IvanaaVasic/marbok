"use client";
import clsx from "clsx";
import { useState, useRef } from "react";

import NavModal from "@/components/NavModal/NavModal";
import SvgHamburger from "@/components/SvgHamburger/SvgHamburger";

import styles from "./Navigation.module.css";

function Navigation({ pages }) {
  const [isOpen, setIsOpen] = useState(false);

  const navRef = useRef(null);

  const handleClick = (e, id) => {
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

      <NavModal ref={navRef} className={styles.dialog} isOpen={isOpen}>
        <nav className={styles.navigationContainer}>
          <ul className={styles.list}>
            {pages.map(({ title, image }) => (
              <li key={title} className={clsx(styles.listItem)}>
                <a href={`#${title}`} className={styles.link}>
                  {image && (
                    <img
                      src={image}
                      alt={title}
                      className={styles.sideBarImage}
                      onClick={(e) => handleClick(e, title)}
                    />
                  )}
                  <p onClick={(e) => handleClick(e, title)}> {title}</p>
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
