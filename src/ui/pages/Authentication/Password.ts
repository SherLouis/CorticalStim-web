export const isPasswordSecure = (value: string) => {
    // Au moins 8 caractères avec au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial
    let regex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}[\]:;<>,.?~\\/-]{8,}$/);
    return regex.test(value);
}
