import React from "react";
import styles from "./Navigation.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";

function Navigation() {
  const router = useRouter();

  const pathName = router.pathname;

  return (
    <div className={styles.container}>
      <Link href={`/`} className={styles.listItem}>
        <p
          className={`${styles.link} ${
            pathName === "/" ? styles.activeLink : ""
          }`}
        >
          Naslovna
        </p>
      </Link>
      <Link href={`/catalog`} className={styles.listItem}>
        <p
          className={`${styles.link} ${
            pathName === "/catalog" ? styles.activeLink : ""
          }`}
        >
          Katalog proizvoda
        </p>
      </Link>
      <Link href={`/aboutus`} className={styles.listItem}>
        <p
          className={`${styles.link} ${
            pathName === "/aboutus" ? styles.activeLink : ""
          }`}
        >
          O nama
        </p>
      </Link>
      <Link href={`/contact`} className={styles.listItem}>
        <p
          className={`${styles.link} ${
            pathName === "/contact" ? styles.activeLink : ""
          }`}
        >
          Kontakt
        </p>
      </Link>
    </div>
  );
}

export default Navigation;
