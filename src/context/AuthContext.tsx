import { createContext, useContext, useEffect, useState } from "react";
import { AuthenticationProvider } from "../core/auth/authenticationProvider";
import User from "../core/auth/user";

type AuthContextProps = { authProvider: AuthenticationProvider, children: React.ReactNode }

type ContextState = { user: User | null, isAuthenticated: boolean, authProvider: AuthenticationProvider };

const AuthContext = createContext<ContextState | undefined>(undefined);

const AuthContextProvider = ({ authProvider, children }: AuthContextProps) => {
    const [user, setUser] = useState<User | null>(null);
    const value = {user: user, isAuthenticated: user!=null, authProvider: authProvider} as ContextState

    useEffect(() => {
        const unsubscribe = authProvider.observeCurrentUser((user) => {
            setUser(user);
        });
        //return unsubscribe;
    }, [authProvider])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuthState = () => {
    const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuthState must be used within a AuthContextProvider')
	}
	return context
  }

export { AuthContextProvider, useAuthState };