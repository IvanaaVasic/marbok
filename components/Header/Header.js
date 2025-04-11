import NavigationMobile from "@/components/NavigationMobile/NavigationMobile";
import styles from "@/pages/category/page.module.css";
import Cart from "@/components/Cart/Cart";
import Link from "next/link";
import { useRouter } from "next/router";
import Navigation from "@/components/Navigation/Navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import StoreSelector from "@/components/StoreSelector/StoreSelector";
import { useStore } from "@/context/StoreContext";
import { MdStorefront } from "react-icons/md";

function Header({ category, setFilteredProducts, categories, stores }) {
    const router = useRouter();
    const {
        selectedStore,
        isStoreSelectorOpen,
        setIsStoreSelectorOpen,
        handleStoreSelect,
    } = useStore();
    const pathName = router.pathname;
    const isCategoryPage = pathName === "/category/[slug]";
    const isMd = useMediaQuery(1000);
    const isLg = useMediaQuery(1380);
    console.log(isLg);

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
        <>
            <div className={styles.logoWrapper}>
                {isCategoryPage && !isLg && (
                    <div className={styles.searchContainer}>
                        <input
                            type="search"
                            placeholder="Pretraži..."
                            onChange={handleSearch}
                            className={styles.searchInput}
                        />
                        <button
                            className={styles.storeButton}
                            onClick={() => setIsStoreSelectorOpen(true)}
                        >
                            <MdStorefront className={styles.storeIcon} />
                            <span>
                                {selectedStore
                                    ? selectedStore.name
                                    : "Izaberi Prodavnicu"}
                            </span>
                        </button>
                    </div>
                )}
                {isCategoryPage && isLg && (
                    <div className={styles.searchContainer}>
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
                    {!isCategoryPage && !isLg && (
                        <button
                            className={styles.storeButton}
                            onClick={() => setIsStoreSelectorOpen(true)}
                        >
                            <MdStorefront className={styles.storeIcon} />
                            <span>
                                {selectedStore
                                    ? selectedStore.name
                                    : "Izaberi Prodavnicu"}
                            </span>
                        </button>
                    )}
                    {!isMd && <Navigation categories={categories} />}
                    <Cart />
                    {(isMd || isCategoryPage) && (
                        <NavigationMobile
                            category={category}
                            categories={categories}
                        />
                    )}
                </div>
                <StoreSelector
                    stores={stores}
                    isOpen={isStoreSelectorOpen}
                    onClose={() => setIsStoreSelectorOpen(false)}
                    onStoreSelect={(store) => {
                        handleStoreSelect(store);
                        setIsStoreSelectorOpen(false);
                    }}
                />
            </div>
            {isLg && (
                <button
                    className={styles.storeButtonMobile}
                    onClick={() => setIsStoreSelectorOpen(true)}
                >
                    <MdStorefront className={styles.storeIcon} />
                    <span>
                        {selectedStore
                            ? selectedStore.name
                            : "Izaberi Prodavnicu"}
                    </span>
                </button>
            )}
        </>
    );
}

export default Header;
