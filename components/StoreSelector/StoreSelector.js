import { useState, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import { IoClose } from "react-icons/io5";
import { MdStorefront, MdSearch, MdCheck, MdLocationOn, MdDeleteOutline } from "react-icons/md";
import { filterStores } from "@/utils/storeSearch";
import styles from "./StoreSelector.module.css";

export default function StoreSelector({ stores = [], selectedStore, isOpen, onClose, onStoreSelect, onClearSelection }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [field, setField] = useState("all");
    const [sort, setSort] = useState("asc");
    const filtered = useMemo(() => filterStores(stores, searchQuery, field, sort), [stores, searchQuery, field, sort]);
    const reset = () => { setSearchQuery(""); setField("all"); setSort("asc"); };
    return (
        <Dialog open={Boolean(isOpen)} onClose={onClose} fullWidth maxWidth="sm"
            aria-labelledby="store-selector-title" PaperProps={{ className: styles.paper }}>
            <div className={styles.header}>
                <div><span className={styles.eyebrow}>PORUDŽBINA ZA PRODAVNICU</span><h2 id="store-selector-title">Izaberi prodavnicu</h2></div>
                <div className={styles.headerActions}>
                {selectedStore && <button type="button" className={styles.iconButton} onClick={onClearSelection}
                    title="Poništi izbor prodavnice" aria-label="Poništi izbor prodavnice"><MdDeleteOutline /></button>}
                <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Zatvori izbor prodavnice"><IoClose /></button></div>
            </div>
            {selectedStore && <div className={styles.current}>
                <MdCheck aria-hidden="true" /><div><span>Trenutno izabrana</span><strong>{selectedStore.name}</strong><small>{selectedStore.address}</small></div>
            </div>}
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <MdSearch aria-hidden="true" />
                    <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Naziv, adresa, PIB ili šifra…" aria-label="Pretraži prodavnice" />
                </div>
                <div className={styles.filters}>
                    <label>Pretraži po<select value={field} onChange={e => setField(e.target.value)}>
                        <option value="all">Svim podacima</option><option value="name">Nazivu</option>
                        <option value="address">Adresi / mestu</option><option value="pib">PIB-u</option>
                        <option value="pass">Šifri kupca</option><option value="contactPerson">Kontakt osobi</option>
                        <option value="phone">Telefonu</option><option value="email">Mejlu</option>
                    </select></label>
                    <label>Redosled<select value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="asc">Naziv A–Ž</option><option value="desc">Naziv Ž–A</option>
                    </select></label>
                </div>
                <div className={styles.results}><span aria-live="polite">Prikazano {filtered.length} od {stores?.length || 0}</span>
                    {(searchQuery || field !== "all" || sort !== "asc") && <button type="button" onClick={reset}>Poništi filtere</button>}
                </div>
            </div>
            <div className={styles.storeList}>
                {filtered.map(store => {
                    const active = store._id === selectedStore?._id;
                    return <button type="button" key={store._id} aria-pressed={active}
                        className={`${styles.storeItem} ${active ? styles.selected : ""}`} onClick={() => onStoreSelect(store)}>
                        <span className={styles.storeIcon}><MdStorefront aria-hidden="true" /></span>
                        <span className={styles.storeInfo}><strong>{store.name || "Prodavnica bez naziva"}</strong>
                            {store.address && <span className={styles.address}><MdLocationOn aria-hidden="true" />{store.address}</span>}
                            {(store.pib || store.pass) && <span className={styles.metadata}>{store.pib && <span>PIB {store.pib}</span>}{store.pass && <span>Šifra {store.pass}</span>}</span>}
                            {store.contactPerson && <span className={styles.contact}>{store.contactPerson}</span>}
                        </span>
                        {active && <MdCheck className={styles.check} aria-label="Izabrana prodavnica" />}
                    </button>;
                })}
                {!filtered.length && <div className={styles.empty}><MdSearch /><h3>Nema pronađenih prodavnica</h3><p>Probaj deo naziva, adresu ili PIB.</p><button type="button" onClick={reset}>Prikaži sve prodavnice</button></div>}
            </div>
            <div className={styles.footer}>Izaberi prodavnicu za koju praviš porudžbinu.</div>
        </Dialog>
    );
}
