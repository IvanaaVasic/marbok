import { useMemo } from "react";
import { getOrder } from "@/sanity/sanity-utils";
import { urlFromThumbnail } from "@/utils/image";
import { formatDate } from "@/utils/dateFormat";
import Link from "next/link";
import styles from "./Order.module.css";
import { useGetCurrentUser } from "@/hooks/useGetCurrentUser";
import { useAuth } from "@/hooks/useAuth";

export default function OrderConfirmation({ order }) {
    const { user } = useAuth();
    const { data: userData } = useGetCurrentUser({ uid: user?.uid ?? null });
    const roles = useMemo(() => userData?.roles || [], [userData]);
    const isAdmin = roles.includes("admin");
    console.log(isAdmin);
    if (!order) return <div>Porudžbina nije pronađena</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Potvrda porudžbine</h1>
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
            </div>
            <div className={styles.orderItems}>
                <h2>Proizvodi:</h2>
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
                                <strong>Cena:</strong> {item.price}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
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
