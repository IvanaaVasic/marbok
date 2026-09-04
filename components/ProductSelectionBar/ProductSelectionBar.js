import { useRef, useState } from "react";
import { MdClose, MdDeleteOutline } from "react-icons/md";
import { FaFileExcel } from "react-icons/fa6";
import Dialog from "@mui/material/Dialog";
import { toast } from "react-toastify";
import { useProductSelection } from "@/context/ProductSelectionContext";
import { productIdentity, selectedCategories } from "@/utils/productSelection";
import { downloadFile } from "@/utils/shareFile";
import { auth } from "@/config/firebase";
import { isOwner } from "@/utils/adminAccess";
import styles from "./ProductSelectionBar.module.css";

export default function ProductSelectionBar() {
    const { allowed, active, items, toggle, clear } = useProductSelection();
    const [busy, setBusy] = useState(false);
    const [review, setReview] = useState(false);
    const exporting = useRef(false);
    if (!allowed || !active) return null;
    const exportSelected = async () => {
        if (!items.length || exporting.current || !isOwner(auth.currentUser)) return;
        const snapshot = [...items];
        exporting.current = true; setBusy(true);
        try {
            const { createCatalogWorkbook } = await import("@/utils/catalogWorkbook");
            const workbook = await createCatalogWorkbook(selectedCategories(snapshot), { selectedOnly: true });
            const buffer = await workbook.xlsx.writeBuffer();
            if (!isOwner(auth.currentUser)) return;
            downloadFile(new File([buffer], `MARBOK_Ponuda_izabrani_${snapshot.length}_${new Date().toISOString().slice(0,10)}.xlsx`, {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }));
            toast.success(`Ponuda sa ${snapshot.length} proizvoda je preuzeta.`);
        } catch { toast.error("Ponuda nije napravljena. Izbor je sačuvan, pokušaj ponovo."); }
        finally { exporting.current = false; setBusy(false); }
    };
    return <>
        <div className={styles.spacer} />
        <div className={styles.bar} role="region" aria-label="Izabrani proizvodi za ponudu">
            <button className={styles.cancel} disabled={busy} onClick={clear} aria-label="Poništi izbor svih proizvoda" title="Poništi izbor"><MdDeleteOutline /></button>
            <button className={styles.count} onClick={() => setReview(true)} aria-label={`Pregledaj izbor: ${items.length} proizvoda`}>
                <strong aria-live="polite">Izabrano: {items.length}</strong><span>Pregledaj izbor</span>
            </button>
            <button className={styles.export} disabled={busy || !items.length} onClick={exportSelected}>
                <FaFileExcel /><span>{busy ? "Pravim ponudu…" : "Excel ponuda"}</span>
            </button>
        </div>
        <Dialog open={review} onClose={() => setReview(false)} fullWidth maxWidth="sm" aria-labelledby="selected-products-title">
            <div className={styles.reviewHeader}><h2 id="selected-products-title">Izabrani proizvodi ({items.length})</h2>
                <button onClick={() => setReview(false)} aria-label="Zatvori pregled"><MdClose /></button></div>
            <div className={styles.list}>{items.map(entry => <div key={productIdentity(entry.product)} className={styles.row}>
                <div><strong>{entry.product.name}</strong><span>{entry.categoryTitle} · Šifra: {entry.product.productKey || "—"}</span></div>
                <button disabled={busy} aria-label={`Ukloni ${entry.product.name} iz ponude`} onClick={() => toggle(entry)}><MdDeleteOutline /></button>
            </div>)}{!items.length && <p>Još nema izabranih proizvoda. Označi ih kružićima na slikama.</p>}</div>
            <div className={styles.reviewFooter}><button onClick={() => setReview(false)}>Nastavi izbor</button>
                <button disabled={busy || !items.length} onClick={exportSelected}>{busy ? "Pravim ponudu…" : "Preuzmi Excel ponudu"}</button></div>
        </Dialog>
    </>;
}
