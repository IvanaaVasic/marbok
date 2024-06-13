import React, { useState } from "react";
import styles from "./Navigation.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoMdArrowDropdown } from "react-icons/io";
import Dropdown from "@/components/Dropdown/Dropdown";

function Navigation({ categories }) {
    const router = useRouter();

    const pathName = router.pathname;
    const [dropdown, setDropdown] = useState(false);

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

            <span
                className={styles.listItem}
                onClick={() => setDropdown((prev) => !prev)}
            >
                <p
                    className={`${styles.link} ${
                        pathName === "/catalog" ? styles.activeLink : ""
                    }`}
                >
                    Katalog proizvoda
                </p>
                <IoMdArrowDropdown
                    className={`${styles.dropdownIcon} ${
                        dropdown && styles.arrowUp
                    }`}
                />
                {dropdown && (
                    <Dropdown
                        submenus={categories}
                        dropdown={dropdown}
                        className={styles.dropdown}
                    />
                )}
            </span>

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
