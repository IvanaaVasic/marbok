import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Layout from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { isOwner } from "@/utils/adminAccess";
import { getCategories, getPages, getStores } from "@/sanity/sanity-utils";
import styles from "@/styles/AccountApprovals.module.css";

const LABELS = {
    pending: "Čeka odobrenje",
    approved: "Odobren",
    rejected: "Odbijen",
};

export default function AccountApprovals({ initialPages, initialCategory, initialStores }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const loadRequests = useCallback(async () => {
        if (!user || !isOwner(user)) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch("/api/access/requests", {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error);
            setRequests(body.requests || []);
        } catch (error) {
            toast.error(error.message || "Zahteve nije moguće učitati.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return;
        if (!isOwner(user)) {
            router.replace("/");
            return;
        }
        loadRequests();
    }, [authLoading, user, router, loadRequests]);

    const updateStatus = async (id, status) => {
        if (busyId) return;
        setBusyId(id);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/access/requests/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error);
            setRequests((current) => current.map((request) =>
                request._id === id ? { ...request, approvalStatus: status } : request
            ));
            toast.success(status === "approved" ? "Pristup cenama je odobren." : "Zahtev je odbijen.");
        } catch (error) {
            toast.error(error.message || "Promenu nije moguće sačuvati.");
        } finally {
            setBusyId(null);
        }
    };

    const sorted = [...requests].sort((a, b) => {
        if (a.approvalStatus === b.approvalStatus) return 0;
        if (a.approvalStatus === "pending") return -1;
        if (b.approvalStatus === "pending") return 1;
        return 0;
    });

    return <Layout pages={initialPages} categories={initialCategory} stores={initialStores}>
        {() => <main className={styles.page}>
            <div className={styles.heading}>
                <div><h1>Odobravanje naloga</h1><p>Novi korisnik vidi cene tek kada mu odobriš pristup.</p></div>
                <button type="button" onClick={loadRequests} disabled={loading}>Osveži</button>
            </div>
            {loading ? <p className={styles.empty}>Učitavanje zahteva...</p> : sorted.length === 0 ?
                <p className={styles.empty}>Još nema zahteva za odobravanje.</p> :
                <div className={styles.list}>{sorted.map((request) => <article className={styles.card} key={request._id}>
                    <div className={styles.info}>
                        <div className={styles.titleRow}><h2>{request.name || request.contactPerson || "Novi korisnik"}</h2>
                            <span className={`${styles.status} ${styles[request.approvalStatus]}`}>{LABELS[request.approvalStatus] || request.approvalStatus}</span></div>
                        <dl>
                            <div><dt>Kontakt</dt><dd>{request.contactPerson || "—"}</dd></div>
                            <div><dt>Email</dt><dd>{request.email || "—"}</dd></div>
                            <div><dt>Telefon</dt><dd>{request.phone || "—"}</dd></div>
                            <div><dt>PIB</dt><dd>{request.pib || "—"}</dd></div>
                            <div><dt>Adresa</dt><dd>{request.address || "—"}</dd></div>
                            <div><dt>Registrovan</dt><dd>{request.registeredAt ? new Date(request.registeredAt).toLocaleString("sr-RS") : "—"}</dd></div>
                        </dl>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.reject} type="button" disabled={busyId === request._id} onClick={() => updateStatus(request._id, "rejected")}>Odbij</button>
                        <button className={styles.approve} type="button" disabled={busyId === request._id} onClick={() => updateStatus(request._id, "approved")}>Odobri pristup</button>
                    </div>
                </article>)}</div>}
        </main>}
    </Layout>;
}

export async function getServerSideProps() {
    const [initialPages, initialCategory, initialStores] = await Promise.all([
        getPages(), getCategories(), getStores(),
    ]);
    return { props: { initialPages, initialCategory, initialStores } };
}
