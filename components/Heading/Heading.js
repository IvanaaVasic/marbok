import React from "react";
import styles from "./Heading.module.css";

function Heading({ mainHeading }) {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>{mainHeading.header}</h2>
        <p className={styles.mainIntro}>{mainHeading.description}</p>
      </div>
    </div>
  );
}

export default Heading;
