import Navigation from "@/components/Navigation/Navigation";
import styles from "@/pages/page.module.css";
import Cart from "@/components/Cart/Cart";
import Link from "next/link";

function Header({ pages }) {
  return (
    <div className={styles.logoWrapper}>
      <Link href={`/`}>
        <img className={styles.logo} src="/logo.png" alt="Logo" />
      </Link>
      <div className={styles.cartNavWrapper}>
        <Cart />
        <Navigation pages={pages?.content} />
      </div>
    </div>
  );
}
export default Header;
