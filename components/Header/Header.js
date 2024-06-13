import NavigationMobile from "@/components/NavigationMobile/NavigationMobile";
import styles from "@/pages/category/page.module.css";
import Cart from "@/components/Cart/Cart";
import Link from "next/link";
import { useRouter } from "next/router";
import Navigation from "@/components/Navigation/Navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function Header({ category, setFilteredProducts, categories }) {
    const router = useRouter();

    const pathName = router.pathname;

    const isCategoryPage = pathName === "/category/[slug]";

    const isMd = useMediaQuery(1000);

    const handleSearch = (e) => {
        const query = e.target.value.trim().toLowerCase();
        const filtered = category.categoryProducts.flatMap((page) =>
            page.contentArea?.filter((area) => {
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
            {isCategoryPage && (
                <div>
                    <input
                        type="search"
                        placeholder="Pretraži..."
                        onChange={handleSearch}
                        className={styles.searchInput}
                    />
                </div>
            )}
            <Link href={`/`}>
                <img className={styles.logo} src="/logo.png" alt="Logo" />
            </Link>
            <div className={styles.cartNavWrapper}>
                {!isMd && <Navigation categories={categories} />}
                <Cart />
                {(isMd || isCategoryPage) && (
                    <NavigationMobile
                        category={category}
                        categories={categories}
                    />
                )}
            </div>
        </div>
    );
}
export default Header;
