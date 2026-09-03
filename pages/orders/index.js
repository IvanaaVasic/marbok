import { getOrders } from "@/sanity/sanity-utils";
import Link from "next/link";
import { formatDate } from "@/utils/dateFormat";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetCurrentUser } from "@/hooks/useGetCurrentUser";

import styles from "./Orders.module.css";

export default function Orders({ orders }) {
    const [searchQuery, setSearchQuery] = useState("");
    const { user, loading: isAuthLoading } = useAuth();
    const { data: userData, isLoading: isUserLoading } = useGetCurrentUser({
        uid: user?.uid ?? null,
    });
    const isAdmin = (userData?.roles || []).includes("admin");

    const filteredOrders = useMemo(() => {
        const query = searchQuery.trim().toLocaleLowerCase("sr-Latn-RS");
        if (!query) return orders;

        return orders.filter((order) =>
            [
                order.orderNumber,
                order.customerName,
                order.email,
                order.phone,
                order.pib,
                order.pass,
            ].some((value) =>
                String(value || "")
                    .toLocaleLowerCase("sr-Latn-RS")
                    .includes(query)
            )
        );
    }, [orders, searchQuery]);

    if (isAuthLoading || (user && isUserLoading)) {
        return <div className={styles.statusMessage}>Učitavanje porudžbina...</div>;
    }

    if (!user || !isAdmin) {
        return (
            <div className={styles.statusMessage}>
                <h1>Porudžbine</h1>
                <p>Ova stranica je dostupna samo administratoru.</p>
                <Link href="/auth" className={styles.primaryLink}>
                    Prijavi se
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Porudžbine</h1>
                <Link href="/" className={styles.backLink}>
                    Nazad na početnu
                </Link>
            </div>
            <div className={styles.toolbar}>
                <div>
                    <strong>{orders.length}</strong>
                    <span> ukupno porudžbina</span>
                </div>
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Broj, kupac, PIB ili šifra..."
                    aria-label="Pretraži porudžbine"
                    className={styles.searchInput}
                />
            </div>
            <div className={styles.ordersList}>
                {filteredOrders.map((order) => (
                    <Link
                        href={`/order/${order.orderNumber}`}
                        key={order._id}
                        className={styles.orderCard}
                    >
                        <div className={styles.cardHeader}>
                            <span className={styles.orderNumber}>
                                {order.orderNumber}
                            </span>
                            <span className={styles.orderDate}>
                                {formatDate(new Date(order.createdAt))}
                            </span>
                        </div>
                        <h3>{order.customerName || "Kupac bez naziva"}</h3>
                        <div className={styles.orderMeta}>
                            {order.pib && <span>PIB: {order.pib}</span>}
                            {order.pass && <span>Šifra kupca: {order.pass}</span>}
                            <span>Artikala: {order.items?.length || 0}</span>
                        </div>
                        <div className={styles.cardFooter}>
                            <strong>{order.totalPrice || "Iznos nije sačuvan"}</strong>
                            <span>Otvori detalje →</span>
                        </div>
                    </Link>
                ))}
            </div>
            {!filteredOrders.length && (
                <div className={styles.emptyState}>
                    Nema porudžbina koje odgovaraju pretrazi „{searchQuery}“.
                </div>
            )}
        </div>
    );
}

export async function getServerSideProps() {
    const orders = await getOrders();

    return {
        props: {
            orders,
        },
    };
}
