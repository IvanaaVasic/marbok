import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { MdClose, MdDeleteOutline, MdShare, MdDownload } from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";
import { orderItems } from "@/utils/orderDocument";
import { isOwner } from "@/utils/adminAccess";
import { shareFile, downloadFile } from "@/utils/shareFile";
import styles from "./OrderActions.module.css";

export default function OrderActions({ order, onClose, onDelete }) {
    const { user } = useAuth();
    const [files, setFiles] = useState({});
    const [error, setError] = useState("");
    const [sharing, setSharing] = useState(false);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        if (!order || !isOwner(user)) return;
        let cancelled = false;
        const controller = new AbortController();
        setFiles({}); setError("");
        (async () => {
            const token = await user.getIdToken();
            const response = await fetch(`/api/orders/${encodeURIComponent(order._id)}`, {
                headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Porudžbina nije učitana.");
            if (cancelled) return;
            const full = data.order;
            const prepare = async (format, build) => {
                try {
                    const file = await build();
                    if (!cancelled) setFiles(current => ({ ...current, [format]: file }));
                } catch {
                    if (!cancelled) setError("Priprema fajla nije uspela. Pokušaj ponovo.");
                }
            };
            await Promise.all([
                prepare("pdf", async () => (await import("@/utils/orderPdf")).createOrderPdfFile(full)),
                prepare("excel", async () => (await import("@/utils/orderExcel")).createOrderExcelFile({
                    orderNumber: full.orderNumber, createdAt: full.createdAt,
                    customer: { name: full.customerName || "", email: full.email || "", phone: full.phone || "" },
                    selectedStore: full.pib || full.pass ? { name: full.customerName, pib: full.pib, pass: full.pass } : null,
                    items: orderItems(full),
                })),
            ]);
        })().catch(err => { if (!cancelled) setError(err.message || "Priprema fajla nije uspela."); });
        return () => { cancelled = true; controller.abort(); };
    }, [order, user, attempt]);
    const share = async file => {
        if (sharing) return;
        setError(""); setSharing(true);
        // File preparation finishes before this click, preserving native share activation.
        try {
            const result = await shareFile(file);
            if (result === "downloaded") setError("Fajl je preuzet. Na ovom uređaju ga pošalji iz Preuzimanja.");
        } catch { setError("Deljenje nije dostupno. Preuzmi fajl i pošalji ga iz Preuzimanja."); }
        finally { setSharing(false); }
    };
    return <Dialog open={Boolean(order) && isOwner(user)} onClose={sharing ? undefined : onClose} maxWidth="xs" fullWidth aria-labelledby="order-actions-title">
        <div className={styles.content}>
            <div className={styles.header}><h2 id="order-actions-title">Podeli porudžbinu</h2><button aria-label="Zatvori" disabled={sharing} onClick={onClose}><MdClose /></button></div>
            <p className={styles.orderNumber}>{order?.orderNumber}</p>
            <p>Izaberi format, pa aplikaciju u kojoj želiš da pošalješ fajl.</p>
            {[['pdf', 'PDF'], ['excel', 'Excel']].map(([key, label]) => <div className={styles.fileRow} key={key}>
                <div><strong>{label}</strong><span>{files[key] ? "Spremno za slanje" : "Priprema fajla…"}</span></div>
                <button disabled={!files[key] || sharing} onClick={() => share(files[key])}><MdShare /> Podeli</button>
                <button className={styles.download} aria-label={`Preuzmi ${label}`} title={`Preuzmi ${label}`} disabled={!files[key] || sharing} onClick={() => downloadFile(files[key])}><MdDownload /></button>
            </div>)}
            {error && <div role="status" className={styles.message}>{error}{(!files.pdf || !files.excel) && <button onClick={() => setAttempt(value => value + 1)}>Pokušaj ponovo</button>}</div>}
            <button className={styles.deleteButton} disabled={sharing} onClick={() => { const selected = order; onClose(); onDelete(selected); }}><MdDeleteOutline /> Obriši porudžbinu</button>
        </div>
    </Dialog>;
}
