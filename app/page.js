import React from "react";
import { getPages } from "@/sanity/sanity-utils";
import styles from "./page.module.css";
import Tooltip from "@/components/Tooltip/Tooltip";
import Content from "@/components/Content/Content";

export const revalidate = 10;

export default async function Home() {
  const pages = await getPages();

  return (
    <div>
      <div className={styles.logoWrapper}>
        <img className={styles.logo} src="/logo.jpg" alt="Logo" />
      </div>
      <div className={styles.container}>
        <Content pages={pages} />
      </div>

      <div className={styles.sidePaginationContainer}>
        {pages?.content.map((page) => (
          <a href={`#${page?.title}`} key={page?.title}>
            <Tooltip text={page?.title}>
              {page?.image && (
                <img
                  src={page?.image}
                  alt={page?.title}
                  className={styles.sideBarImage}
                />
              )}
            </Tooltip>
          </a>
        ))}
      </div>
      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <p>marbok.bgd@gmail.com</p>{" "}
          <span className={styles.separator}>|</span> <p>011/ 3472 890</p>{" "}
          <span className={styles.separator}>|</span>
          <p>067/ 77 00 771</p>
        </div>
        <p>Copyright © {new Date().getFullYear()}, Marbok DOO</p>
      </div>
    </div>
  );
}
