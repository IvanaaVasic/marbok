import React from "react";
import styles from "./Heading.module.css";
import clsx from "clsx";

function Heading({
  mainHeading,
  className,
  wrapperClassName,
  headingClassName,
  mainIntroClassName,
}) {
  return (
    <div className={clsx(styles.container, className)}>
      <div className={clsx(styles.wrapper, wrapperClassName)}>
        <h2 className={clsx(styles.heading, headingClassName)}>
          {mainHeading.header}
        </h2>
        <p className={clsx(styles.mainIntro, mainIntroClassName)}>
          {mainHeading.description}
        </p>
      </div>
    </div>
  );
}

export default Heading;
