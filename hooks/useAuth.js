import { useEffect, useState, useCallback } from "react";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOutUser = useCallback(async () => {
        await auth.signOut();
        setUser(null);
    }, []);

    return { user, loading, signOutUser };
};
