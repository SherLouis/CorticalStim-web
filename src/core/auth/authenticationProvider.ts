import User from "./user";

export interface AuthenticationProvider {
    // Create a user with username password. Username can be any string (email or other)
    createUser(username: string, password: string, displayName?: string) : Promise<User>;

    signIn(username: string, password: string) : Promise<User>;

    signOut(): Promise<void>;

    deleteUser(username: string, password: string): void;
}