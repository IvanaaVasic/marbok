import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { auth } from "@/config/firebase";
import { useAuth } from "@/hooks/useAuth";
import styles from "./B2BAccessGate.module.css";

const errorMap = {
    "auth/invalid-email": "Nevažeći e-mail.",
    "auth/invalid-credential": "E-mail ili lozinka nisu ispravni.",
    "auth/user-not-found": "Korisnik nije pronađen.",
    "auth/wrong-password": "E-mail ili lozinka nisu ispravni.",
    "auth/too-many-requests": "Previše pokušaja. Pokušaj ponovo kasnije.",
};

export default function B2BAccessGate({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const registrationPage = router.pathname === "/auth/signup";

    if (registrationPage) return children;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage("");

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            await router.replace("/catalog");
        } catch (error) {
            setErrorMessage(
                error instanceof FirebaseError
                    ? errorMap[error.code] || "Prijavljivanje nije uspelo."
                    : "Prijavljivanje nije uspelo."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Provera prijave...</div>;
    }

    if (user) return children;

    return (
        <>
            <Head>
                <title>Marbok B2B | Prijavljivanje</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <main className={styles.page}>
                <section className={styles.card}>
                    <img src="/logo.png" alt="Marbok" className={styles.logo} />
                    <p className={styles.eyebrow}>Marbok B2B</p>
                    <h1 className={styles.title}>Prijavljivanje</h1>
                    <p className={styles.description}>
                        Prijavi se da otvoriš B2B katalog.
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <label className={styles.label}>
                            E-mail
                            <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={styles.input}
                            />
                        </label>
                        <label className={styles.label}>
                            Lozinka
                            <input
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className={styles.input}
                            />
                        </label>

                        {errorMessage && (
                            <p className={styles.error}>{errorMessage}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={styles.button}
                        >
                            {isSubmitting ? "Prijavljivanje..." : "Prijavi se"}
                        </button>
                    </form>

                    <p className={styles.registration}>
                        Nemaš nalog?{" "}
                        <Link href="/auth/signup">Registruj se</Link>
                    </p>
                </section>
            </main>
        </>
    );
}
