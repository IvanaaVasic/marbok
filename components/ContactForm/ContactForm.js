import React, { useState, useEffect } from "react";
import styles from "../Input/Input.module.css";
import { useForm, FormProvider } from "react-hook-form";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import Textarea from "@/components/TextArea/TextArea";
import emailjs from "@emailjs/browser";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { createOrder } from "@/sanity/sanity-utils";
import { createOrderExcelFile } from "@/utils/orderExcel";

const EMAIL_SERVICE_ID = "service_pn5jvkb";
const EMAIL_TEMPLATE_ID = "template_ji1obt8";
const EMAIL_PUBLIC_KEY = "vEKyEbs258TNVtxqI";

function appendFormValue(form, name, value) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value || "";
    form.appendChild(input);
}

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

    const triggerEmail = async (data, excelFile) => {
        try {
            if (excelFile) {
                const form = document.createElement("form");
                form.enctype = "multipart/form-data";
                Object.entries(data).forEach(([name, value]) =>
                    appendFormValue(form, name, value)
                );

                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.name = "order_excel";
                const fileList = new DataTransfer();
                fileList.items.add(excelFile);
                fileInput.files = fileList.files;
                form.appendChild(fileInput);
                document.body.appendChild(form);

                try {
                    await emailjs.sendForm(
                        EMAIL_SERVICE_ID,
                        EMAIL_TEMPLATE_ID,
                        form,
                        EMAIL_PUBLIC_KEY
                    );
                    return { sent: true, excelAttached: true };
                } finally {
                    form.remove();
                }
            }

            await emailjs.send(
                EMAIL_SERVICE_ID,
                EMAIL_TEMPLATE_ID,
                data,
                EMAIL_PUBLIC_KEY
            );
            return { sent: true, excelAttached: false };
        } catch (error) {
            console.error("Failed to send email", error);
            if (excelFile) {
                try {
                    await emailjs.send(
                        EMAIL_SERVICE_ID,
                        EMAIL_TEMPLATE_ID,
                        data,
                        EMAIL_PUBLIC_KEY
                    );
                    return { sent: true, excelAttached: false };
                } catch (fallbackError) {
                    console.error("Failed to send fallback email", fallbackError);
                }
            }
            return { sent: false, excelAttached: false };
        }
    };
    const onSubmit = (cart) => async (data) => {
        if (isSubmitting) return;
        if (!cart?.length) {
            toast.error("Dodajte bar jedan proizvod u korpu.");
            return;
        }

        setIsSubmitting(true);
        const { firstName, email, phone, message } = data;

        const orderData = {
            firstName,
            email,
            phone,
            message,
            pib: selectedStore?.pib || "",
            pass: selectedStore?.pass || "",
            items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                productKey: item.productKey,
                price: item.price,
            })),
        };

        try {
            const order = await createOrder(orderData);
            const orderUrl = `${window.location.origin}/order/${order.orderNumber}`;

            const emailData = {
                firstName,
                email,
                phone,
                orderNumber: order.orderNumber,
                message: `${message || ""}\n\nLink ka potvrdi porudžbine: ${orderUrl}\n\nProizvodi:\n${cart
                    ?.map(
                        (item) =>
                            `proizvod: ${item.name}, kolicina: ${item.quantity}, šifra: ${item.productKey}, cena: ${item.price}`
                    )
                    .join("\n")}`,
            };

            let orderExcel = null;
            try {
                orderExcel = await createOrderExcelFile({
                    orderNumber: order.orderNumber,
                    customer: { name: firstName, email, phone },
                    selectedStore,
                    items: cart,
                });
            } catch (excelError) {
                console.error("Failed to create order Excel", excelError);
            }

            const emailResult = await triggerEmail(emailData, orderExcel);

            clearCart();
            if (emailResult.sent && emailResult.excelAttached) {
                toast.success("Porudžbina i Excel su uspešno poslati.");
            } else if (emailResult.sent) {
                toast.warning(
                    "Porudžbina je poslata, ali Excel prilog nije dodat u email."
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

    useEffect(() => {
        if (selectedStore) {
            setValue("firstName", selectedStore.name);
            setValue("email", selectedStore.email);
            setValue("phone", selectedStore.phone);
        }
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
