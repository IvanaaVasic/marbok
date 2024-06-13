import styles from "./Dropdown.module.css";
import clsx from "clsx";

function Dropdown({ submenus, dropdown, className }) {
    return (
        <ul
            className={clsx(
                styles.dropdown,
                { [styles.show]: dropdown },
                className
            )}
        >
            {submenus?.map((submenu, index) => (
                <li key={index} className={styles.menuItems}>
                    <a href={`/category/${submenu?.slug?.current}`}>
                        {submenu?.title}
                    </a>
                </li>
            ))}
        </ul>
    );
}

export default Dropdown;
