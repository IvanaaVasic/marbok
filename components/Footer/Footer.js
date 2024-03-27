import styles from "@/pages/page.module.css";
import clsx from "clsx";

function Footer({ footerClassName }) {
  return (
    <div className={clsx(styles.footer, footerClassName)}>
      <div className={styles.footerInfo}>
        <p>marbok.bgd@gmail.com</p> <span className={styles.separator}>|</span>{" "}
        <p>011/ 3472 890</p> <span className={styles.separator}>|</span>
        <p>067/ 77 00 771</p>
      </div>
      <p>Copyright © {new Date().getFullYear()}, Marbok DOO</p>
    </div>
  );
}
export default Footer;
