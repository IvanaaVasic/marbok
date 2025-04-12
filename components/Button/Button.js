import React from "react";
import styles from "./Button.module.css";
import clsx from "clsx";
import Link from "next/link";

function Button({
    btnType,
    theme,
    content,
    size,
    handleClick,
    disable,
    className,
    href,
}) {
    if (href) {
        return (
            <Link
                href={href}
                className={`${styles.btn} ${styles[theme]} ${styles[size]} ${className}`}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type={btnType}
            className={clsx(`${styles[theme]} ${styles[size]} ${className}`)}
            onClick={handleClick}
            disabled={disable}
        >
            {content}
        </button>
    );
}

export default Button;
