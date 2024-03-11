import clsx from "clsx";
import * as React from "react";
import { createPortal } from "react-dom";

import styles from "./NavModal.module.css";

function NavModal({ isOpen, className, children }) {
  if (!isOpen) {
    return null;
  }
  return createPortal(
    <div className={clsx(styles.modal, className)}>{children}</div>,
    document.getElementById("modal")
  );
}

export default NavModal;
