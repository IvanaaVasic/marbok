import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { db, auth, storage } from "../../config/firebase";
import { FormProvider, useForm } from "react-hook-form";
import {
    CircularProgress as MuiCircularProgress,
    Select,
    Typography,
    styled,
} from "@mui/material";
import { TextField } from "../TextField/TextField";
import Button from "@/components/Button/Button";

import Link from "next/link";
import { FirebaseError } from "firebase/app";
import styles from "./RegistrationForm.module.css";
import { FaUser, FaPhoneAlt } from "react-icons/fa";
import { MdEmail, MdPassword } from "react-icons/md";

const errorMap = {
    "auth/email-already-in-use": "Email je već u upotrebi",
    "auth/missing-email": "Email je obavezan",
};

const CustomizedCircularProgress = styled(MuiCircularProgress)`
    & .MuiCircularProgress-svg {
        color: var(--color-brand);
    }
`;

const CustomizedSelect = styled(Select)`
    & .MuiFormControl-root {
        border-radius: 8px;
        background: #f0e4f2;
    }
    & .MuiOutlinedInput-input {
        padding: 12px;
    }
`;

export const RegistrationForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const methods = useForm({
        mode: "onChange",
    });
    const {
        formState: { isDirty, isValid },
    } = methods;
    const router = useRouter();

    const onSubmit = async (values) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
            );

            if (userCredential.user) {
                const userData = {
                    uid: userCredential.user.uid,
                    email: values.email,
                    phone: values.phone,
                    roles: ["user"],
                    createdDay: new Date().toISOString(),
                    name: values.name,
                };

                const userDocRef = doc(db, "users", userCredential.user.uid);
                await setDoc(userDocRef, userData);

                setRegistrationSuccessful(true);
                router.push("/");
            }
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
        <div className={styles.registerContainer}>
            <div className={styles.content}>
                <FormProvider {...methods}>
                    <form
                        onSubmit={methods.handleSubmit(onSubmit)}
                        className={styles.form}
                    >
                        <div className={styles.formWrapper}>
                            <div className={styles.heading}>Kreiraj nalog</div>
                            <p className={styles.intro}>
                                Ukoliko još uvek nemaš, kreiraj svoj nalog!
                            </p>
                            <div className={styles.textFieldsWrapper}>
                                <TextField
                                    placeholder="Ime i Prezime"
                                    className={styles.input}
                                    icon={FaUser}
                                    {...methods.register("name", {
                                        required: "Ime i Prezime su obavezni",
                                    })}
                                />
                                <TextField
                                    placeholder="Telefon"
                                    type="tel"
                                    icon={FaPhoneAlt}
                                    {...methods.register("phone", {
                                        required: "Telefon je obavezan",
                                    })}
                                />
                                <TextField
                                    placeholder="E-mail"
                                    type="email"
                                    icon={MdEmail}
                                    {...methods.register("email", {
                                        required: "E-mail je obavezan",
                                    })}
                                />
                                <TextField
                                    placeholder="Lozinka"
                                    type="password"
                                    icon={MdPassword}
                                    {...methods.register("password", {
                                        required: "Lozinka je obavezna",
                                        minLength: {
                                            value: 8,
                                            message:
                                                "Lozinka mora imati najmanje 8 karaktera",
                                        },
                                        pattern: {
                                            value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
                                            message:
                                                "Lozinka mora sadržati barem jedno veliko slovo i jedan broj",
                                        },
                                    })}
                                />
                                <TextField
                                    placeholder="Potvrdi lozinku"
                                    type="password"
                                    icon={MdPassword}
                                    {...methods.register("confirmPassword", {
                                        required: "Potvrda lozinke je obavezna",
                                        validate: (value) =>
                                            value ===
                                                methods.getValues("password") ||
                                            "Lozinke se ne podudaraju",
                                    })}
                                />

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
                        </div>
                        <div className={styles.actionBtnWrapper}>
                            <Button
                                btnType="submit"
                                theme="primary"
                                content="Nastavi"
                                size="fullWidth"
                                disable={
                                    isLoading ||
                                    registrationSuccessful ||
                                    !isDirty ||
                                    !isValid
                                }
                            />
                        </div>
                        {registrationSuccessful && (
                            <div className={styles.redirecting}>
                                <CustomizedCircularProgress
                                    size={15}
                                    value={30}
                                    className={styles.spinner}
                                />
                                <Typography variant="overline" marginLeft={1}>
                                    Redirecting...
                                </Typography>
                            </div>
                        )}
                        <p className={styles.account}>
                            Već imaš nalog?{" "}
                            <span className={styles.signInLink}>
                                <Link href="/auth/login">Uloguj se</Link>
                            </span>
                        </p>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};
