import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, sendEmailVerification, Auth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { User as FirebaseUser } from "firebase/auth";
import firebaseApp from './firebaseApp'
import { AuthenticationProvider } from "../../core/auth/authenticationProvider";
import User from "../../core/auth/user";
import AuthenticationError, { AuthenticationErrorReason } from "../../core/auth/authenticationError";

export default class firebaseAuthenticationProvider implements AuthenticationProvider {

    private auth: Auth;

    private currentUser: User | null = null;
    private userObservers: ((user: User | null) => void)[] = [];
    private unsubscribe: () => void;

    constructor() {
        this.auth = getAuth(firebaseApp);
        setPersistence(this.auth, browserSessionPersistence);
        // Initialize auth state observer
        this.unsubscribe = this.initAuthStateObserver();
    }

    private initAuthStateObserver() {
        return this.auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                this.currentUser = this.assembleUserFromFirebaseUser(firebaseUser);
            } else {
                // User is signed out
                this.currentUser = null;
            }
            // Notify all observers
            this.notifyObservers();
        });
    }

    private notifyObservers() {
        this.userObservers.forEach(observer => observer(this.currentUser));
    }

    private assembleUserFromFirebaseUser(fbuser: FirebaseUser): User {
        return {
            displayName: fbuser.displayName,
            username: fbuser.email,
            isVerifiedUser: fbuser.emailVerified
        } as User;
    }

    private mapFirebaseErrorMessageToAuthenticationErrorReason(errorMessage: string): AuthenticationErrorReason {
        switch (errorMessage) {
            case "EMAIL_EXISTS":
                return AuthenticationErrorReason.EMAIL_EXISTS;
            case "INVALID_LOGIN_CREDENTIALS":
                return AuthenticationErrorReason.INVALID_LOGIN_CREDENTIALS;
            case "USER_DISABLED":
                return AuthenticationErrorReason.USER_DISABLED;
            default:
                return AuthenticationErrorReason.UNKNOWN;
        }
    }

    private async setDisplayName(displayName: string) {
        if (this.auth.currentUser == null) { return; }
        return updateProfile(this.auth.currentUser, { displayName: displayName })
            .then(() => {
                if (this.auth.currentUser != null) {
                    let user = this.assembleUserFromFirebaseUser(this.auth.currentUser);
                    user.displayName = displayName;
                    this.currentUser = user;
                    this.notifyObservers();
                }
            });
    }

    public async createUser(username: string, password: string, displayName?: string): Promise<User> {
        return createUserWithEmailAndPassword(this.auth, username, password)
            .then((userCredential) => {
                // Signed up 
                const firebaseUser = userCredential.user;
                if (displayName) {
                    return this.setDisplayName(displayName)
                        .then(() => {
                            let user = this.assembleUserFromFirebaseUser(firebaseUser);
                            user.displayName = displayName;
                            return user;
                        })
                        .catch((error) => {
                            throw new AuthenticationError("Error updating profile", this.mapFirebaseErrorMessageToAuthenticationErrorReason(error.message));
                        })
                        .finally(() => this.sendVerification());
                }
                else {
                    return this.assembleUserFromFirebaseUser(firebaseUser);
                }
            })
            .catch((error) => {
                throw new AuthenticationError("Error creating account", this.mapFirebaseErrorMessageToAuthenticationErrorReason(error.message));
            });
    }

    public async signIn(username: string, password: string): Promise<User> {
        return signInWithEmailAndPassword(this.auth, username, password)
            .then((userCredential) => {
                // Signed in 
                const firebaseUser = userCredential.user;
                return this.assembleUserFromFirebaseUser(firebaseUser);
                // ...
            })
            .catch((error) => {
                throw new AuthenticationError("Error signing in user", this.mapFirebaseErrorMessageToAuthenticationErrorReason(error.message));
            });
    }

    public async signOut(): Promise<void> {
        return signOut(this.auth).catch((error) => { console.error(error); });
    }

    public observeCurrentUser(observer: (user: User | null) => void): () => void {
        // Add observer to the list
        this.userObservers.push(observer);
        // Immediately notify the observer with the current user
        observer(this.currentUser);
        return this.unsubscribe;
    }

    public async sendVerification(): Promise<void> {
        if (this.auth.currentUser != null) {
            await sendEmailVerification(this.auth.currentUser)
        }
    }

}