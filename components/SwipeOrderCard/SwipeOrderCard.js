import { useRef, useState } from "react";
import Link from "next/link";
import { MdDeleteOutline, MdMoreHoriz } from "react-icons/md";
import { formatDate } from "@/utils/dateFormat";
import styles from "@/pages/orders/Orders.module.css";

export default function SwipeOrderCard({ order, open, onToggle, onDelete, onActions }) {
    const start = useRef(null);
    const dragged = useRef(false);
    const [offset, setOffset] = useState(null);
    const finish = (cancelled = false) => {
        if (!start.current) return;
        if (!cancelled && start.current.axis === "x") {
            onToggle(start.current.offset < -40);
        }
        start.current = null;
        setOffset(null);
    };
    return <div className={styles.swipeRow}>
        <button type="button" className={styles.deleteAction} tabIndex={open ? 0 : -1}
            aria-hidden={!open} aria-label={`Obriši porudžbinu ${order.orderNumber}`}
            onClick={() => onDelete(order)}><MdDeleteOutline aria-hidden="true" /><span>Obriši</span></button>
        <article className={styles.orderCard} style={{ transform: `translateX(${offset ?? (open ? -88 : 0)}px)` }}
            onPointerDown={event => {
                if (event.pointerType === "mouse" || event.target.closest("button")) return;
                dragged.current = false;
                start.current = { x: event.clientX, y: event.clientY, base: open ? -88 : 0, offset: open ? -88 : 0, axis: null };
            }}
            onPointerMove={event => {
                const point = start.current;
                if (!point) return;
                const dx = event.clientX - point.x, dy = event.clientY - point.y;
                if (!point.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
                    point.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
                    if (point.axis === "x") event.currentTarget.setPointerCapture(event.pointerId);
                }
                if (point.axis !== "x") return;
                dragged.current = true;
                point.offset = Math.max(-88, Math.min(0, point.base + dx));
                setOffset(point.offset);
            }}
            onPointerUp={() => finish()} onPointerCancel={() => finish(true)}
            onClickCapture={event => {
                if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false; }
            }}>
            <div className={styles.cardHeader}><span className={styles.orderNumber}>{order.orderNumber}</span>
                <button type="button" className={styles.moreButton} aria-label={`Opcije porudžbine ${order.orderNumber}`}
                    aria-haspopup="dialog" onClick={() => onActions(order)}><MdMoreHoriz aria-hidden="true" /></button></div>
            <span className={styles.orderDate}>{formatDate(new Date(order.createdAt))}</span>
            <Link href={`/order/${order.orderNumber}`} className={styles.detailsLink}
                onClick={event => { if (open) { event.preventDefault(); onToggle(false); } }}>
                <h3>{order.customerName || "Kupac bez naziva"}</h3>
                <div className={styles.orderMeta}>
                    {order.pib && <span>PIB: {order.pib}</span>}
                    {order.pass && <span>Šifra kupca: {order.pass}</span>}
                    <span>Artikala: {order.itemCount || 0}</span>
                </div>
                <div className={styles.cardFooter}><strong>{order.totalPrice || "Iznos nije sačuvan"}</strong><span>Otvori detalje →</span></div>
            </Link>
        </article>
    </div>;
}
