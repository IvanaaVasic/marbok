import { getOrders } from "@/sanity/sanity-utils";
import Link from "next/link";
import { formatDate } from "@/utils/dateFormat";

import styles from "./Orders.module.css";

export default function Orders({ orders }) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Porudžbine</h1>
                <Link href="/" className={styles.backLink}>
                    Nazad na početnu
                </Link>
            </div>
            <div className={styles.ordersList}>
                {orders.map((order) => (
                    <Link
                        href={`/order/${order.orderNumber}`}
                        key={order._id}
                        className={styles.orderCard}
                    >
                        <h3>Porudžbina: {order.orderNumber}</h3>
                        <p>Ime: {order.customerName}</p>
                        <p>Datum: {formatDate(new Date(order.createdAt))}</p>
                        <p>Proizvodi: {order.items.length}</p>
                    </Link>
                ))}
            </div>
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
