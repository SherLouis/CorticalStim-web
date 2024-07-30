export default class AuthenticationError extends Error{
    public reason: AuthenticationErrorReason;

    constructor(message: string, reason: AuthenticationErrorReason) {
        super(message);
        this.name = 'FirebaseAuthError';
        this.reason = reason;
      }
}

export enum AuthenticationErrorReason {
    USER_DISABLED,
    INVALID_LOGIN_CREDENTIALS,
    EMAIL_EXISTS,
    UNKNOWN
}