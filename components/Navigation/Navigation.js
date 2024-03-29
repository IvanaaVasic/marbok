import React from "react";
import styles from "./Navigation.module.css";
import Link from "next/link";

function Navigation() {
  return (
    <div className={styles.container}>
      <Link href={`/`} className={styles.listItem}>
        <p className={styles.link}>Naslovna</p>
      </Link>
      <Link href={`/catalog`} className={styles.listItem}>
        <p className={styles.link}>Katalog proizvoda</p>
      </Link>
      <Link href={`/contact`} className={styles.listItem}>
        <p className={styles.link}>Kontakt</p>
      </Link>
    </div>
  );
}

export default Navigation;
