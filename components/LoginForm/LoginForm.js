import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "next/router";
import styles from "./LoginForm.module.css";
import { TextField } from "../TextField/TextField";
import { Typography } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { FormProvider, useForm } from "react-hook-form";
import { MdEmail, MdPassword } from "react-icons/md";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import Button from "@/components/Button/Button";

const errorMap = {
    "auth/wrong-password": "Pogrešna lozinka",
    "auth/user-not-found": "Korisnik nije pronađen",
    "auth/invalid-email": "Nevažeći e-mail",
    "auth/invalid-credential": "Email ili šifra su neispravni",
};

export const LoginForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loginSuccessful, setLoginSuccessful] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const router = useRouter();
    const methods = useForm();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;

        if (isLoading) return;

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoginSuccessful(true);
            router.push("/");
        } catch (error) {
            setErrorMessage(
                error instanceof FirebaseError
                    ? errorMap[error.code] ?? error.message
                    : "Došlo je do greške"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.heading}>Prijavi se</div>
            <p className={styles.intro}>
                Ukoliko već imaš otvoren nalog, prijavi se!
            </p>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.textFieldsWrapper}>
                        <TextField
                            placeholder="E-mail"
                            name="email"
                            type="email"
                            className={styles.input}
                            required
                            icon={MdEmail}
                        />
                        <div className={styles.passwordWrapper}>
                            <TextField
                                placeholder="Lozinka"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className={styles.input}
                                required
                                icon={MdPassword}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className={styles.toggleButton}
                            >
                                {showPassword ? (
                                    <AiFillEyeInvisible />
                                ) : (
                                    <AiFillEye />
                                )}
                            </button>
                        </div>
                        {errorMessage && (
                            <Typography
                                variant="body2"
                                color="error"
                                className={styles.error}
                            >
                                {errorMessage}
                            </Typography>
                        )}
                    </div>
                    <Button
                        btnType="submit"
                        theme="primary"
                        content="Prijavi se"
                        size="fullWidth"
                        disable={isLoading}
                    />

                    {loginSuccessful && (
                        <Typography
                            variant="body2"
                            color="primary"
                            className={styles.success}
                        >
                            Uspešno ste se prijavili!
                        </Typography>
                    )}
                    <p className={styles.account}>
                        Nemaš nalog?{" "}
                        <span className={styles.signInLink}>
                            <Link href="/auth/signup">Registruj se</Link>
                        </span>
                    </p>
                    <p className={styles.account}>
                        <span className={styles.signInLink}>
                            <Link href="/forgot-password">
                                Zaboravila/o si šifru?
                            </Link>
                        </span>
                    </p>
                </form>
            </FormProvider>
        </div>
    );
};
