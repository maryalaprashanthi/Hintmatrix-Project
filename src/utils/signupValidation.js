export const PASSWORD_HELP = "Use at least 8 characters, including uppercase, lowercase, a number and a special character.";

export function signupFieldErrors({ email, password, confirmPassword }) {
  const errors = {};
  if (!email.trim()) errors.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address, for example name@example.com.";
  }
  if (!password) errors.password = "Password is required.";
  else if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) || !/[^A-Za-z0-9\s]/.test(password)) {
    errors.password = PASSWORD_HELP;
  } else if (new TextEncoder().encode(password).length > 72) {
    errors.password = "Password is too long (maximum 72 UTF-8 bytes).";
  }
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
  return errors;
}
