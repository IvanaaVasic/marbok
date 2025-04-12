import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const getCurrentUser = async ({ uid }) => {
    if (!uid) {
        console.warn("getCurrentUser called with an invalid uid:", uid);
        return null;
    }
    try {
        const userDoc = doc(db, "users", uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            return data;
        } else {
            console.log("No document found at path:", userDoc.path);
            return null;
        }
    } catch (err) {
        console.error("Error fetching user data:", err);
        throw err;
    }
};
