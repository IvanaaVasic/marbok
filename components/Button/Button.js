import React from "react";
import styles from "./Button.module.css";
import clsx from "clsx";

function Button({
  btnType,
  theme,
  content,
  size,
  handleClick,
  disable,
  className,
}) {
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
