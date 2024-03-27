import React from "react";
import styles from "./Experience.module.css";

import { MdOutlineWork } from "react-icons/md";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";

export const experience = [
  {
    classBox: "boxOne",
    comment: "Marbok doo preduzeće je osnovano pre više od 20 godina.",
    info: "20+ godina iskustva",
    icon: <MdOutlineWork />,
  },
  {
    classBox: "boxTwo",
    comment:
      "Marbok DOO nudi visokokvalitetne proizvode svetskih konditorkih brendova kao i kućne hemije.",
    info: "500+ proizvoda",
    icon: <MdOutlineProductionQuantityLimits />,
  },
  {
    classBox: "boxThree",
    comment:
      "Preduzece MARBOK d.o.o. kao uvoznik i distrubuter snažnih i renomiranih brendova u svetu slatkiša i kvalitetnih proizvoda za održavanje kućne hemije.",
    info: "5,000+ klijenata",
    icon: <FaPeopleGroup />,
  },
];

function Experience() {
  return (
    <div className={styles.experienceContainer}>
      <h2 className={styles.experienceHeading}>- Naše iskustvo -</h2>
      <div className={styles.container}>
        {experience.map(({ classBox, icon, comment, info }, idx) => {
          return (
            <div
              className={`${styles[classBox]} ${styles.boxDecoration}`}
              key={idx}
            >
              <div className={styles.imageInfoWrapper}>
                <div className={styles.icon}>{icon}</div>
                <p className={styles.info}>{info}</p>
              </div>
              <p className={styles.testimoialText}>{comment}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Experience;
