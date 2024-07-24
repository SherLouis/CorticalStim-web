import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, Auth } from "firebase/auth";
import { User as FirebaseUser } from "firebase/auth";
import firebaseApp from './firebaseApp'
import { AuthenticationProvider } from "../../core/auth/authenticationProvider";
import User from "../../core/auth/user";
import AuthenticationError, { AuthenticationErrorReason } from "../../core/auth/authenticationError";

export default class firebaseAuthenticationProvider implements AuthenticationProvider {

    private auth: Auth;

    private currentUser: User | null = null;
    private userObservers: ((user: User | null) => void)[] = [];

    constructor() {
        this.auth = getAuth(firebaseApp);
        // Initialize auth state observer
        this.initAuthStateObserver();
    }

    private initAuthStateObserver() {
        this.auth.onAuthStateChanged((firebaseUser) => {
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

    public createUser(username: string, password: string, displayName?: string): Promise<User> {
        // TODO: send email for verification once user is created
        return createUserWithEmailAndPassword(this.auth, username, password)
            .then((userCredential) => {
                // Signed up 
                const firebaseUser = userCredential.user;
                if (displayName) {
                    return updateProfile(firebaseUser, { displayName: displayName })
                        .then(() => {
                            return this.assembleUserFromFirebaseUser(firebaseUser);
                        }).catch((error) => {
                            throw new AuthenticationError("Error updating profile", this.mapFirebaseErrorMessageToAuthenticationErrorReason(error.message));
                        });
                }
                else {
                    return this.assembleUserFromFirebaseUser(firebaseUser);
                }
            })
            .catch((error) => {
                throw new AuthenticationError("Error creating account", this.mapFirebaseErrorMessageToAuthenticationErrorReason(error.message));
            });
    }

    public signIn(username: string, password: string): Promise<User> {
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

    public signOut(): Promise<void> {
        // TODO: implement signout method
        return signOut(this.auth).catch((error) => { console.error(error); });
    }

    public deleteUser(username: string, password: string): void {
        // TODO: implement delete user method
        throw new Error("Method not implemented.");
    }

    public observeCurrentUser(observer: (user: User | null) => void) {
        // Add observer to the list
        this.userObservers.push(observer);
        // Immediately notify the observer with the current user
        observer(this.currentUser);
      }

}