import React, { useState, useEffect, useRef } from "react";
import styles from "../Input/Input.module.css";
import { useForm, FormProvider } from "react-hook-form";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import Textarea from "@/components/TextArea/TextArea";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { auth } from "@/config/firebase";
import { createOrderExcelFile } from "@/utils/orderExcel";

function ContactForm({ selectedStore }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { cart, clearCart } = useCart();
    const methods = useForm();
    const router = useRouter();
    const {
        handleSubmit,
        formState: { errors },
        setValue,
    } = methods;

    const expression =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const triggerEmail = async (orderNumber) => {
        try {
            const response = await fetch("/api/orders/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${await auth.currentUser.getIdToken()}` },
                body: JSON.stringify({ orderNumber }),
            });
            return response.ok;
        } catch { return false; }
    };
    const onSubmit = (cart) => async (data) => {
        if (isSubmitting) return;
        if (!cart?.length) {
            toast.error("Dodajte bar jedan proizvod u korpu.");
            return;
        }

        setIsSubmitting(true);
        const { companyName, pib, firstName, email, phone, message } = data;

        const orderData = {
            companyName,
            pib,
            firstName,
            email,
            phone,
            message,
            pass: selectedStore?.pass || "",
            items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                productKey: item.productKey,
                price: item.price,
            })),
        };

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error("Prijava je istekla.");
            const createResponse = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...orderData, storeId: selectedStore?._id }),
            });
            if (!createResponse.ok) throw new Error((await createResponse.json()).error);
            const { order } = await createResponse.json();
            const orderUrl = `${window.location.origin}/order/${order.orderNumber}`;

            let orderExcelUrl = null;
            try {
                const orderExcel = await createOrderExcelFile({
                    orderNumber: order.orderNumber,
                    customer: { companyName, pib, name: firstName, email, phone },
                    selectedStore,
                    items: order.items.map((item) => ({
                        ...item,
                        image: cart.find((cartItem) => cartItem.productKey === item.productKey)?.image,
                    })),
                });
                const data = btoa(Array.from(new Uint8Array(await orderExcel.arrayBuffer()), byte => String.fromCharCode(byte)).join(""));
                const uploadResponse = await fetch("/api/orders/upload-excel", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ orderNumber: order.orderNumber, data }),
                });
                if (!uploadResponse.ok) throw new Error("Excel nije sačuvan.");
                orderExcelUrl = (await uploadResponse.json()).url;
            } catch (excelError) {
                console.error("Failed to create or upload order Excel", excelError);
            }

            const emailSent = await triggerEmail(order.orderNumber);

            clearCart();
            if (emailSent && orderExcelUrl) {
                toast.success(
                    "Porudžbina je poslata. Excel je dostupan u emailu."
                );
            } else if (emailSent) {
                toast.warning(
                    "Porudžbina je poslata, ali Excel nije napravljen."
                );
            } else {
                toast.warning(
                    "Porudžbina je sačuvana, ali email obaveštenje nije poslato."
                );
            }
            router.push(`/order/${order.orderNumber}`);
        } catch (error) {
            console.error("Failed to create order:", error);
            toast.error("Došlo je do greške! Molimo pokušajte ponovo!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const previousStore = useRef(null);
    useEffect(() => {
        if (selectedStore) {
            setValue("companyName", selectedStore.name || "");
            setValue("pib", selectedStore.pib || "");
            setValue("firstName", selectedStore.contactPerson || "");
            setValue("email", selectedStore.email);
            setValue("phone", selectedStore.phone);
        } else if (previousStore.current) {
            setValue("companyName", "");
            setValue("pib", "");
            setValue("firstName", "");
            setValue("email", "");
            setValue("phone", "");
        }
        previousStore.current = selectedStore;
    }, [selectedStore, setValue]);

    const clearInputError = (fieldName) => {
        if (errors[fieldName]) {
            methods.clearErrors(fieldName);
        }
    };

    return (
        <div className={`${styles.sectionWrapper} ${styles.formSection}`}>
            <div className={styles.formWrapper}>
                <h1 className={styles.contactHeader}>Pošaljite porudžbinu</h1>
                <p className={styles.subtitle}>
                    Proverite korpu i unesite podatke za porudžbinu.
                </p>
                {selectedStore && (
                    <div className={styles.selectedStore}>
                        <span>Porudžbina za</span>
                        <strong>{selectedStore.name}</strong>
                        <small>
                            {selectedStore.pib && `PIB: ${selectedStore.pib}`}
                            {selectedStore.pass &&
                                ` · Šifra kupca: ${selectedStore.pass}`}
                        </small>
                    </div>
                )}
                {!cart?.length && (
                    <div className={styles.emptyCartWarning}>
                        Korpa je prazna. Dodajte proizvode pre slanja porudžbine.
                    </div>
                )}
                <FormProvider {...methods}>
                    <form
                        className={styles.form}
                        onSubmit={handleSubmit(onSubmit(cart))}
                    >
                        <Input
                            label="Naziv firme"
                            inputType="text"
                            placeholder="Naziv firme..."
                            registerField="companyName"
                            required
                            minLength={2}
                            onChange={() => clearInputError("companyName")}
                        />
                        <Input
                            label="PIB"
                            inputType="text"
                            inputMode="numeric"
                            maxLength={9}
                            placeholder="PIB firme (9 cifara)..."
                            registerField="pib"
                            required
                            expression={/^\d{9}$/}
                            errorMsg="PIB oznaku od 9 cifara"
                            onChange={() => clearInputError("pib")}
                        />
                        <Input
                            label="Ime"
                            inputType="text"
                            placeholder="Tvoje ime..."
                            registerField="firstName"
                            required
                            minLength={3}
                            onChange={() => clearInputError("firstName")}
                        />
                        <Input
                            label="Email"
                            inputType="text"
                            placeholder="Tvoja Email Adresa... "
                            registerField="email"
                            required
                            expression={expression}
                            errorMsg="email adresu"
                            onChange={() => clearInputError("email")}
                        />
                        <Input
                            label="Kontakt telefon"
                            inputType="text"
                            placeholder="Tvoj Kontakt telefon... "
                            registerField="phone"
                            required
                            onChange={() => clearInputError("phone")}
                        />
                        <Textarea
                            label="Poruka"
                            placeholder="Dodatna napomena za porudžbinu..."
                            registerField="message"
                        />
                        <Button
                            btnType="submit"
                            theme="primary"
                            content={
                                isSubmitting
                                    ? "Šaljem porudžbinu..."
                                    : "Pošalji porudžbinu"
                            }
                            size="fullWidth"
                            disable={
                                Object.keys(errors).length > 0 ||
                                isSubmitting ||
                                !cart?.length
                            }
                            className={styles.submitButton}
                        />
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}

export default ContactForm;
