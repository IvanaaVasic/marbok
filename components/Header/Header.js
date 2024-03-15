import Navigation from "@/components/Navigation/Navigation";
import styles from "@/pages/page.module.css";
import Cart from "@/components/Cart/Cart";
import Link from "next/link";

function Header({ pages, setFilteredProducts }) {
  const handleSearch = (e) => {
    const query = e.target.value.trim().toLowerCase();
    const filtered = pages.content.flatMap((page) =>
      page.contentArea.filter((area) => {
        return area.name.toLowerCase().includes(query);
      })
    );

    setFilteredProducts((prevFilteredProducts) => {
      if (query === "") {
        return [];
      } else {
        return filtered;
      }
    });
  };

  return (
    <div className={styles.logoWrapper}>
      <div>
        <input
          type="search"
          placeholder="Pretraži..."
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>
      <Link href={`/`}>
        <img className={styles.logo} src="/logo.png" alt="Logo" />
      </Link>
      <div className={styles.cartNavWrapper}>
        <Cart />
        <Navigation pages={pages.content} />
      </div>
    </div>
  );
}
export default Header;
