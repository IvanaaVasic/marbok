import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogAccess } from "@/context/CatalogAccessContext";
import styles from "./AccessStatusBanner.module.css";

export default function AccessStatusBanner() {
    const { user } = useAuth();
    const { status, loading } = useCatalogAccess();
    if (!user || loading || status === "approved") return null;

    if (status === "rejected") {
        return <div className={`${styles.banner} ${styles.rejected}`} role="status">
            Pristup cenama nije odobren. Ako misliš da je došlo do greške, <Link href="/contact">kontaktiraj nas</Link>.
        </div>;
    }
    if (status === "error") {
        return <div className={`${styles.banner} ${styles.error}`} role="status">
            Pristup cenama trenutno nije moguće proveriti. Osveži stranicu malo kasnije.
        </div>;
    }
    return <div className={styles.banner} role="status">
        Registracija je primljena. Cene i poručivanje biće dostupni čim vlasnik odobri nalog.
    </div>;
}
