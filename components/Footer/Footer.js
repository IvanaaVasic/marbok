import styles from "@/pages/page.module.css";

function Footer() {
  return (
    <div className={styles.footer}>
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
