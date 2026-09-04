import Link from "next/link";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import { MdDeleteOutline } from "react-icons/md";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { isOwner } from "@/utils/adminAccess";
import { normalizeSearch } from "@/utils/storeSearch";
import OrderActions from "@/components/OrderActions/OrderActions";
import SwipeOrderCard from "@/components/SwipeOrderCard/SwipeOrderCard";
import styles from "./Orders.module.css";

export default function Orders() {
    const { user, loading: isAuthLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [openId, setOpenId] = useState(null);
    const [actionOrder, setActionOrder] = useState(null);
    const [pending, setPending] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const deleteLock = useRef(false);
    const allowed = isOwner(user);

    const load = useCallback(async (signal) => {
        if (!isOwner(user)) return;
        setLoading(true); setError("");
        try {
            const token = await user.getIdToken();
            const response = await fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` }, signal });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Učitavanje nije uspelo.");
            if (!signal?.aborted) setOrders(data.orders);
        } catch (err) {
            if (!signal?.aborted) setError(err.message || "Učitavanje nije uspelo.");
        } finally { if (!signal?.aborted) setLoading(false); }
    }, [user]);
    useEffect(() => {
        const controller = new AbortController();
        setOrders([]); setPending(null); setOpenId(null); setActionOrder(null);
        if (allowed) load(controller.signal);
        return () => controller.abort();
    }, [allowed, load]);

    const filtered = useMemo(() => {
        const terms = normalizeSearch(searchQuery).split(/\s+/).filter(Boolean);
        return orders.filter(order => {
            const text = [order.orderNumber, order.customerName, order.email, order.phone, order.pib, order.pass]
                .map(normalizeSearch).join(" ");
            return terms.every(term => text.includes(term));
        });
    }, [orders, searchQuery]);

    const remove = async () => {
        if (!pending || !isOwner(user) || deleteLock.current) return;
        const order = pending;
        deleteLock.current = true; setDeleting(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/orders/${encodeURIComponent(order._id)}`, {
                method: "DELETE", headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Brisanje nije uspelo.");
            setOrders(current => current.filter(item => item._id !== order._id));
            setPending(null); setOpenId(null);
            toast.success("Porudžbina je obrisana.");
        } catch (err) { toast.error(err.message || "Porudžbina nije obrisana. Pokušaj ponovo."); }
        finally { deleteLock.current = false; setDeleting(false); }
    };

    if (isAuthLoading) return <div className={styles.statusMessage}>Učitavanje…</div>;
    if (!allowed) return <div className={styles.statusMessage}><h1>Porudžbine</h1><p>Ova stranica je dostupna samo vlasniku naloga.</p><Link href="/auth" className={styles.primaryLink}>Prijavi se</Link></div>;
    return <div className={styles.container}>
        <div className={styles.header}><h1>Porudžbine</h1><Link href="/" className={styles.backLink}>Nazad na početnu</Link></div>
        <div className={styles.toolbar}>
            <div><strong>{orders.length}</strong><span> ukupno porudžbina</span></div>
            <input type="search" value={searchQuery} onChange={event => { setSearchQuery(event.target.value); setOpenId(null); }}
                placeholder="Broj, kupac, PIB ili šifra…" aria-label="Pretraži porudžbine" className={styles.searchInput} />
        </div>
        <p className={styles.swipeHint}>Tri tačke: deljenje PDF-a i Excela. Prevuci ulevo za brisanje.</p>
        {loading ? <p role="status">Učitavanje porudžbina…</p> : error ? <div role="alert" className={styles.emptyState}><p>{error}</p><button onClick={() => load()} className={styles.backLink}>Pokušaj ponovo</button></div> : <>
            <div className={styles.ordersList}>{filtered.map(order => <SwipeOrderCard key={order._id} order={order}
                open={openId === order._id} onToggle={open => setOpenId(open ? order._id : null)} onDelete={setPending} onActions={setActionOrder} />)}</div>
            {!filtered.length && <div className={styles.emptyState}>{searchQuery ? `Nema porudžbina za pretragu „${searchQuery}“.` : "Još nema porudžbina."}</div>}
        </>}
        <OrderActions key={actionOrder?._id || "closed"} order={actionOrder} onClose={() => setActionOrder(null)} onDelete={setPending} />
        <Dialog open={Boolean(pending)} onClose={() => { if (!deleting) setPending(null); }}
            aria-labelledby="delete-order-title" aria-describedby="delete-order-description" maxWidth="xs" fullWidth>
            <div className={styles.confirmDialog}>
                <MdDeleteOutline className={styles.confirmIcon} aria-hidden="true" />
                <h2 id="delete-order-title">Obriši porudžbinu?</h2>
                <p id="delete-order-description">{pending?.orderNumber}<br /><strong>{pending?.customerName}</strong><br />Porudžbina će biti trajno obrisana.</p>
                <div className={styles.confirmActions}>
                    <button autoFocus disabled={deleting} onClick={() => setPending(null)}>Odustani</button>
                    <button disabled={deleting} onClick={remove} className={styles.confirmDelete}>{deleting ? "Brisanje…" : "Obriši porudžbinu"}</button>
                </div>
            </div>
        </Dialog>
    </div>;
}
