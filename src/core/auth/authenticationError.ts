export default class AuthenticationError extends Error{
    constructor(message: string, reason: AuthenticationErrorReason) {
        super(message);
        this.name = 'FirebaseAuthError';
      }
}

export enum AuthenticationErrorReason {
    USER_DISABLED,
    INVALID_LOGIN_CREDENTIALS,
    EMAIL_EXISTS,
    UNKNOWN
}