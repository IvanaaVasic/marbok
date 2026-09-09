import styles from "./Dropdown.module.css";
import clsx from "clsx";
import { IoIosArrowForward } from "react-icons/io";

function Dropdown({ submenus, dropdown, className, desktop = false }) {
    return (
        <ul
            className={clsx(
                styles.dropdown,
                { [styles.show]: dropdown },
                className,
                { [styles.desktop]: desktop }
            )}
        >
            {submenus?.map((submenu) => {
                const slug = submenu?.slug?.current || submenu?.slug;
                const sections = submenu?.categoryProducts || [];
                return (
                <li key={submenu?._id || slug || submenu?.title} className={styles.menuItems}>
                    <a href={`/category/${slug}`} onClick={(event) => event.stopPropagation()}>
                        <span>{submenu?.title}</span>
                        {desktop && sections.length > 0 && <IoIosArrowForward aria-hidden="true" />}
                    </a>
                    {desktop && sections.length > 0 && (
                        <ul className={styles.sectionDropdown} aria-label={`Sekcije: ${submenu?.title}`}>
                            {sections.map((section) => (
                                <li key={section?._id || section?.title}>
                                    <a href={`/category/${slug}#${encodeURIComponent(section?.title || "")}`} onClick={(event) => event.stopPropagation()}>
                                        {section?.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            )})}
        </ul>
    );
}

export default Dropdown;
