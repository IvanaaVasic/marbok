import { getPages } from "@/sanity/sanity-utils";
import styles from "./page.module.css";
import Tooltip from "@/components/Tooltip/Tooltip";

export const revalidate = 10;

export default async function Home() {
  const pages = await getPages();

  return (
    <div>
      <div className={styles.logoWrapper}>
        <img className={styles.logo} src="/logo.jpg" alt="Logo" />
      </div>
      <div className={styles.container}>
        {pages?.content.map((page) => (
          <div key={page?._id} className={styles.productBlock}>
            {page?.image && (
              <img
                src={page?.image}
                alt={page?.title}
                className={styles.heroImage}
              />
            )}
            <h2 className={styles.productSectionHeader} id={page?.title}>
              {page?.title}
            </h2>
            <div className={styles.contentContainer}>
              {page.contentArea.map((contentArea) => (
                <div key={contentArea?._id} className={styles.productCard}>
                  <img
                    src={contentArea?.image}
                    alt={contentArea?.name}
                    className={styles.img}
                  />
                  {contentArea?.package && (
                    <p className={styles.package}>{contentArea?.package}</p>
                  )}
                  <div className={styles.productInfo}>
                    {contentArea?.name && (
                      <h3 className={styles.productName}>
                        {contentArea?.name}
                      </h3>
                    )}

                    {contentArea?.price && (
                      <div className={styles.fieldInfoWrapper}>
                        <span className={styles.fieldName}>Cena: </span>
                        <span>{contentArea?.price} rsd</span>
                      </div>
                    )}
                    {contentArea?.productKey && (
                      <div className={styles.fieldInfoWrapper}>
                        <span className={styles.fieldName}>
                          Šifra proizvoda:{" "}
                        </span>
                        <span>{contentArea?.productKey}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
