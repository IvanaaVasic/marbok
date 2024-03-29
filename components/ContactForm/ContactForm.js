import React, { useState, useEffect } from "react";
import styles from "../Input/Input.module.css";
import { useForm, FormProvider } from "react-hook-form";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import Textarea from "@/components/TextArea/TextArea";
import emailjs from "@emailjs/browser";
import { useCart } from "@/hooks/useCart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

function ContactForm() {
  const [disable, setDisable] = useState(false);
  const { cart, clearCart } = useCart();
  const methods = useForm();
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const expression =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const triggerEmail = async (data) => {
    await emailjs
      .send("service_pn5jvkb", "template_ji1obt8", data, "vEKyEbs258TNVtxqI")
      .then((success) => {
        toast.success("Uspešno ste poslali upit! Hvala vam!");
        setTimeout(() => {
          router.push("/");
        }, 4000);
      })
      .catch((err) => {
        toast.error("Email nije poslat! Molimo pokušajte ponovo!");
        console.error("Failed to send email", err);
      });
  };
  const onSubmit = (data) => {
    triggerEmail(data);
    clearCart();
  };

  useEffect(() => {
    const { message, firstName, email, phone } = errors;
    const errorTypes = [
      message?.type,
      firstName?.type,
      email?.type,
      phone?.type,
    ];
    if (
      errorTypes.includes("required") ||
      errorTypes.includes("minLength") ||
      errorTypes.includes("pattern")
    ) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [
    errors?.firstName?.type,
    errors?.email?.type,
    errors?.phone?.type,
    errors?.message?.type,
    setDisable,
  ]);

  const clearInputError = (fieldName) => {
    if (errors[fieldName]) {
      methods.clearErrors(fieldName);
    }
  };

  return (
    <div className={`${styles.sectionWrapper} ${styles.formSection}`}>
      <div className={styles.formWrapper}>
        <h1 className={styles.contactHeader}>Pošaljite porudžbinu</h1>
        <p className={styles.subtitle}>Pošaljite upit proizvoda</p>
        <FormProvider {...methods}>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
              label="Message"
              placeholder="Your Message"
              registerField="message"
              defaultValue={cart
                ?.map(
                  (item) =>
                    `proizvod: ${item.name}, kolicina: ${item.quantity}, šifra: ${item.productKey}, cena: ${item.price}`
                )
                .join("\n")}
            />
            <Button
              btnType="submit"
              theme="primary"
              content="pošalji"
              size="regular"
              disable={disable}
            />
            <ToastContainer />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default ContactForm;
