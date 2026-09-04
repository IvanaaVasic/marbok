import { orderItems, parseOrderPrice, formatOrderPrice } from "@/utils/orderDocument";
import { useMemo } from "react";
import { getOrder } from "@/sanity/sanity-utils";
import { urlFromThumbnail } from "@/utils/image";
import { formatDate } from "@/utils/dateFormat";
import Link from "next/link";
import styles from "./Order.module.css";
import { useGetCurrentUser } from "@/hooks/useGetCurrentUser";
import { useAuth } from "@/hooks/useAuth";

function parsePrice(price) {
    const normalized = String(price || "")
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");
    return parseFloat(normalized) || 0;
}

function formatPrice(price) {
    return new Intl.NumberFormat("sr-Latn-RS", {
        maximumFractionDigits: 2,
    }).format(price);
}

export default function OrderConfirmation({ order }) {
    const { user } = useAuth();
    const { data: userData } = useGetCurrentUser({ uid: user?.uid ?? null });
    const roles = useMemo(() => userData?.roles || [], [userData]);
    const isAdmin = roles.includes("admin");
    const calculatedTotal = useMemo(
        () =>
            order?.items?.reduce(
                (sum, item) =>
                    sum +
                    parsePrice(item.price) * (parseInt(item.quantity, 10) || 0),
                0
            ) || 0,
        [order?.items]
    );
    const printItems = useMemo(() => orderItems(order), [order]);
    if (!order) return <div>Porudžbina nije pronađena</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>PORUDŽBINA</span>
                    <h1>{order.orderNumber}</h1>
                </div>
                {isAdmin ? (
                    <Link href="/orders" className={styles.backLink}>
                        Nazad na porudžbine
                    </Link>
                ) : (
                    <Link href="/" className={styles.backLink}>
                        Nazad na početnu
                    </Link>
                )}
            </div>
            <div className={styles.orderInfo}>
                <p>
                    <strong>Datum:</strong> {formatDate(order.createdAt)}
                </p>
                <p>
                    <strong>Broj porudžbine:</strong> {order.orderNumber}
                </p>
                <p>
                    <strong>Ime:</strong> {order.customerName}
                </p>
                <p>
                    <strong>Email:</strong> {order.email}
                </p>
                <p>
                    <strong>Telefon:</strong> {order.phone}
                </p>
                {order.message && (
                    <p>
                        <strong>Poruka:</strong> {order.message}
                    </p>
                )}
                {order.pib && (
                    <p>
                        <strong>PIB:</strong> {order.pib}
                    </p>
                )}
                {order.pass && (
                    <p>
                        <strong>Šifra kupca:</strong> {order.pass}
                    </p>
                )}
            </div>
            <div className={styles.orderItems}>
                <div className={styles.totalPriceContainer}>
                    <h2>Proizvodi</h2>
                    <p className={styles.totalPrice}>
                        <strong>Ukupno:</strong> {formatPrice(calculatedTotal)} RSD
                    </p>
                </div>
                {order?.items?.map((item, index) => (
                    <div key={index} className={styles.item}>
                        {item.productDetails?.image && (
                            <img
                                src={urlFromThumbnail(
                                    item.productDetails.image
                                )}
                                alt={item.name}
                                className={styles.productImage}
                            />
                        )}
                        <div className={styles.itemDetails}>
                            <p>
                                <strong>Ime:</strong> {item.name}
                            </p>
                            <p>
                                <strong>Količina:</strong> {item.quantity}
                            </p>
                            <p>
                                <strong>Šifra proizvoda:</strong>{" "}
                                {item.productKey}
                            </p>
                            <p>
                                <strong>Cena:</strong> {item.price} rsd
                            </p>
                            <p className={styles.itemTotal}>
                                <strong>Iznos:</strong>{" "}
                                {formatPrice(
                                    parsePrice(item.price) *
                                        (parseInt(item.quantity, 10) || 0)
                                )}{" "}
                                RSD
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <table className={styles.printTable}>
                <colgroup><col style={{width: "9%"}} /><col style={{width: "13%"}} /><col style={{width: "36%"}} /><col style={{width: "15%"}} /><col style={{width: "9%"}} /><col style={{width: "18%"}} /></colgroup>
                <thead><tr><th>Slika</th><th>Šifra</th><th>Naziv / pakovanje</th><th>Cena RSD</th><th>Kol.</th><th>Iznos RSD</th></tr></thead>
                <tbody>{printItems.map((item, index) => <tr key={index}>
                    <td>{item.image && <img src={urlFromThumbnail(item.image)} alt="" />}</td>
                    <td>{item.productKey || "—"}</td><td>{item.name}{item.package && <small>Pakovanje: {item.package}</small>}</td>
                    <td>{item.price === undefined || item.price === "" ? "—" : formatOrderPrice(parseOrderPrice(item.price))}</td>
                    <td>{item.quantity}</td><td>{item.price === undefined || item.price === "" ? "—" : formatOrderPrice(parseOrderPrice(item.price) * (parseInt(item.quantity, 10) || 0))}</td>
                </tr>)}</tbody>
            </table>
            <p className={styles.printTotal}>Ukupno: {formatPrice(calculatedTotal)} RSD</p>
            <button
                type="button"
                className={styles.printButton}
                onClick={() => window.print()}
            >
                Odštampaj porudžbinu
            </button>
        </div>
    );
}

export async function getServerSideProps({ params }) {
    const order = await getOrder(params.orderNumber);

    return {
        props: {
            order,
        },
    };
}
