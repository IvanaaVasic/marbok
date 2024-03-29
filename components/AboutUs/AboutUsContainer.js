import styles from "./AboutUsContainer.module.css";
import { FaLocationDot } from "react-icons/fa6";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";

function AboutUsContainer() {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.information}>
          <div className={styles.infoWrapper}>
            <FaLocationDot />
            <p>Nehruova 51 Beograd, Novi Beograd 11070</p>
          </div>
          <div className={styles.infoWrapper}>
            <BsFillTelephoneFill />
            <p> 011/3472-890, 067/77-00-771</p>
          </div>
          <div className={styles.infoWrapper}>
            <MdEmail />
            <p>marbok.bgd@gmail.com</p>
          </div>
        </div>
        <hr className={styles.line} />
        <div className={styles.workingHoursWrapper}>
          <p className={styles.workingHoursHeading}>Radno vreme:</p>
          <div className={styles.hoursWrapper}>
            <p className={styles.workingHours}>Radnim danima: 08:00 - 16:00</p>
            <p className={styles.workingHours}>Subota: 08:00 - 15:00</p>
            <p className={styles.workingHours}>Nedelja: Zatvoreno</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUsContainer;
