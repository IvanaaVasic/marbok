import styles from "./UserAvatar.module.css";
import clsx from "clsx";
export const UserAvatar = ({ name, className }) => {
    const getInitials = (name) => {
        if (!name) return "";
        const words = name.split(" ");
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return words[0][0].toUpperCase();
    };

    return (
        <div className={clsx(styles.avatar, className)}>
            {getInitials(name)}
        </div>
    );
};
