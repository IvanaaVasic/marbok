import React, { useState, useCallback } from "react";
import styles from "@/components/Content/Content.module.css";
import { urlFromThumbnail } from "@/utils/image";
import { FormProvider } from "react-hook-form";
import Button from "@/components/Button/Button";
import { FaCartShopping } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";

function ContentArea({
    contentArea,
    addToCart,
    methods,
    toggleModal,
    className,
    imageClassName,
}) {
    const [internalQuantity, setInternalQuantity] = useState("1");
    const { user } = useAuth();

    const handleAddToCart = async (
        contentAreaName,
        quantity,
        productKey,
        image,
        price
    ) => {
        if (parseInt(quantity) <= 0) {
            toast.success("Kolicina mora biti veća od 0!");
            return;
        }
        const product = {
            name: contentAreaName,
            quantity: quantity,
            productKey: productKey,
            image: image,
            price: price,
        };

        try {
            await addToCart.mutateAsync(product);
        } catch (error) {
            console.error("Error adding product to cart:", error);
        }
    };

    const onChange = useCallback(
        (e) => {
            const value = e.currentTarget?.value;
            if (value === internalQuantity) {
                return;
            }

            if (!value) {
                setInternalQuantity(value);
                return;
            }

            setInternalQuantity(value);
        },
        [internalQuantity, setInternalQuantity]
    );

    const decrement = useCallback(() => {
        const value = Math.max(parseInt(internalQuantity) - 1, 0);
        setInternalQuantity(value.toString());
    }, [internalQuantity, setInternalQuantity]);

    const increment = useCallback(() => {
        const value = parseInt(internalQuantity) + 1;
        setInternalQuantity(value.toString());
    }, [internalQuantity, setInternalQuantity]);

    return (
        <div
            key={contentArea?._id}
            className={clsx(styles.productCard, className)}
        >
            <img
                src={urlFromThumbnail(contentArea?.image)}
                alt={contentArea?.name}
                className={clsx(styles.img, imageClassName)}
                onClick={() => toggleModal(contentArea?._id)}
            />
            {contentArea?.package && (
                <p className={styles.package}>{contentArea?.package}</p>
            )}
            <div className={styles.productInfo}>
                {contentArea?.name && (
                    <h3 className={styles.productName}>{contentArea?.name}</h3>
                )}
                <div className={styles.fieldInfoContainer}>
                    {contentArea?.price && user && (
                        <div className={styles.fieldInfoWrapper}>
                            <span className={styles.fieldName}>Cena: </span>
                            <span>{contentArea?.price} rsd</span>
                        </div>
                    )}
                    {contentArea?.productKey && (
                        <div className={styles.fieldInfoWrapper}>
                            <span className={styles.fieldName}>
                                Šifra proizvoda:{" "}
                            </span>
                            <span>{contentArea?.productKey}</span>
                        </div>
                    )}
                </div>
                <FormProvider {...methods}>
                    <div className={styles.quantityContainer}>
                        <div className={styles.quantityWrapper}>
                            <Button
                                size={"regular"}
                                theme={"primary"}
                                content="-"
                                handleClick={decrement}
                                className={styles.quantityBtn}
                            />
                            <input
                                type="number"
                                value={internalQuantity}
                                onChange={onChange}
                                className={styles.input}
                            />

                            <Button
                                size={"regular"}
                                theme={"primary"}
                                content="+"
                                handleClick={increment}
                                className={styles.quantityBtn}
                            />
                        </div>

                        <FaCartShopping
                            className={styles.cartIcon}
                            onClick={() =>
                                handleAddToCart(
                                    contentArea?.name,
                                    internalQuantity || 0,
                                    contentArea?.productKey,
                                    contentArea?.image,
                                    contentArea?.price
                                )
                            }
                        />
                        <ToastContainer />
                    </div>
                </FormProvider>
            </div>
        </div>
    );
}

export default ContentArea;
