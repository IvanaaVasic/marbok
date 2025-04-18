import styles from "./Checkout.module.css";
import { MdDelete } from "react-icons/md";
import { urlFromThumbnail } from "@/utils/image";
import { useMemo } from "react";

function Checkout({ cart, removeFromCart }) {
    const totalSum = useMemo(() => {
        return cart?.reduce((sum, item) => {
            const price = parseFloat(item.price?.replace(/[^\d.-]/g, "")) || 0;
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
                                <th className={styles.tableHeader}>Proiz.</th>
                                <th className={styles.tableHeader}>Kol.</th>
                                <th className={styles.tableHeader}>Šifra</th>
                                <th className={styles.tableHeader}>Cena</th>
                                <th className={styles.tableHeader}>Del.</th>
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
                                            <p>{item?.quantity}</p>
                                        </td>
                                        <td className={styles.tableData}>
                                            <p>{item?.productKey}</p>
                                        </td>
                                        <td className={styles.tableData}>
                                            <p>
                                                {item?.price
                                                    ? item?.price
                                                    : "/"}
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
                            <strong>Ukupno:</strong> {totalSum} rsd
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
