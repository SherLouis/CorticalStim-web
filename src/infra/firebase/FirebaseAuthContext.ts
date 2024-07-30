import { createContext, useEffect, useState } from "react";
import User from "../../core/auth/user";
import { AuthenticationProvider } from "../../core/auth/authenticationProvider";

type ContextState = { user: User | null };

const FirebaseAuthContext = createContext<ContextState | undefined>(undefined);

const FirebaseAuthProvider = (authProvider: AuthenticationProvider) => {
    const [user, setUser] = useState<User | null>(null);
    const value = { user };

    useEffect(() => {
        const unsubscribe = authProvider.observeCurrentUser((user) => {
            setUser(user);
        });
        return unsubscribe;
    }, [])

    return (FirebaseAuthContext.Provider(value: value));
};

export { FirebaseAuthProvider };