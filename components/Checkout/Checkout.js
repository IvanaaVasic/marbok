import styles from "./Checkout.module.css";
import { MdDelete } from "react-icons/md";
import { urlFromThumbnail } from "@/utils/image";
import { useMemo } from "react";

function parsePrice(price) {
    if (typeof price === "number") return price;

    const normalized = String(price || "")
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");

    return parseFloat(normalized) || 0;
}

function formatPrice(price) {
    return new Intl.NumberFormat("sr-Latn-RS", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);
}

function Checkout({ cart, removeFromCart, updateCartQuantity }) {
    const totalSum = useMemo(() => {
        return cart?.reduce((sum, item) => {
            const price = parsePrice(item.price);
            const quantity = parseInt(item.quantity) || 0;
            return sum + price * quantity;
        }, 0);
    }, [cart]);

    return (
        <div className={styles.checkoutContainer}>
            <h2 className={styles.heading}>Proizvodi dodati u korpu</h2>
            {cart?.length != 0 ? (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.tableHeader}>Sl.</th>
                                <th className={styles.tableHeader}>Proizvod</th>
                                <th className={styles.tableHeader}>Količina</th>
                                <th className={styles.tableHeader}>Šifra</th>
                                <th className={styles.tableHeader}>Cena</th>
                                <th className={styles.tableHeader}>Iznos</th>
                                <th className={styles.tableHeader}></th>
                            </tr>
                        </thead>

                        <tbody>
                            {cart?.map((item, index) => {
                                return (
                                    <tr key={index} className={styles.infoRow}>
                                        {item?.image && (
                                            <td className={styles.tableData}>
                                                <img
                                                    src={urlFromThumbnail(
                                                        item?.image
                                                    )}
                                                    alt={item?.name}
                                                    className={styles.img}
                                                />
                                            </td>
                                        )}
                                        <td className={styles.tableData}>
                                            <p>{item?.name}</p>
                                        </td>
                                        <td className={styles.tableData}>
                                            <div className={styles.quantityControl}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateCartQuantity(
                                                            index,
                                                            (parseInt(item?.quantity, 10) || 1) - 1
                                                        )
                                                    }
                                                    aria-label={`Smanji količinu za ${item?.name}`}
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    inputMode="numeric"
                                                    value={item?.quantity}
                                                    onChange={(event) =>
                                                        updateCartQuantity(
                                                            index,
                                                            event.target.value
                                                        )
                                                    }
                                                    aria-label={`Količina za ${item?.name}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateCartQuantity(
                                                            index,
                                                            (parseInt(item?.quantity, 10) || 0) + 1
                                                        )
                                                    }
                                                    aria-label={`Povećaj količinu za ${item?.name}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className={styles.tableData}>
                                            <p>{item?.productKey}</p>
                                        </td>
                                        <td className={styles.tableData}>
                                            <p>
                                                {item?.price
                                                    ? `${item?.price} RSD`
                                                    : "/"}
                                            </p>
                                        </td>
                                        <td className={`${styles.tableData} ${styles.lineTotal}`}>
                                            <p>
                                                {formatPrice(
                                                    parsePrice(item?.price) *
                                                        (parseInt(item?.quantity, 10) || 0)
                                                )} RSD
                                            </p>
                                        </td>
                                        <td className={styles.tableData}>
                                            <MdDelete
                                                onClick={() =>
                                                    removeFromCart(index)
                                                }
                                                className={styles.deleteIcon}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className={styles.totalContainer}>
                        <p className={styles.totalSum}>
                            <strong>Ukupno:</strong> {formatPrice(totalSum)} RSD
                        </p>
                    </div>
                </>
            ) : (
                <p className={styles.infoMessage}>Nemate proizvode u korpi</p>
            )}
        </div>
    );
}

export default Checkout;
