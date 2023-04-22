
// Email validation
export const isValidEmail = (email) => {
    // Regular expression to check for a valid email address
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email);
};
  
// Password length validation
export const isPasswordLongEnough = (password) => {
    return password.length >= 8;
};

// Password complexity validation
export const hasPasswordRequiredChars = (password) => {
    // Regular expression to check for at least one uppercase letter, one special character, and one digit
    const uppercaseRegex = /[A-Z]/;
    const specialCharRegex = /[!@#$%^&*?]/;
    const digitRegex = /[0-9]/;

    return uppercaseRegex.test(password) && specialCharRegex.test(password) && digitRegex.test(password);
};
  
