import React from "react";
import styles from "./Tooltip.module.css";

function Tooltip(props) {
  const { text, children } = props;
  return (
    <div className={styles.tooltip}>
      {children}
      <span className={styles.tooltiptext}>{text}</span>
    </div>
  );
}

export default Tooltip;
