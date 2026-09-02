// Password requirements from backend
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[^A-Za-z0-9]/,
};

/**
 * Validates password against all requirements
 * @param password - The password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  // Check for spaces first
  if (/\s/.test(password)) {
    return "Password cannot contain spaces";
  }
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return "Password must be at least 8 characters";
  }
  if (!PASSWORD_REQUIREMENTS.hasUppercase.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!PASSWORD_REQUIREMENTS.hasLowercase.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
    return "Password must contain at least one number";
  }
  if (!PASSWORD_REQUIREMENTS.hasSpecial.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
}

/**
 * Calculates password strength on a scale of 0-5
 * @param password - The password to evaluate
 * @returns Strength score (0-5)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (PASSWORD_REQUIREMENTS.hasUppercase.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.hasLowercase.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.hasNumber.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.hasSpecial.test(password)) strength++;
  return strength;
}

/**
 * Sanitizes name input in real-time by stripping disallowed characters.
 * Only allows letters, spaces, hyphens, and apostrophes.
 * @param value - The raw input value
 * @returns Sanitized string with invalid characters removed
 */
export function sanitizeNameInput(value: string): string {
  return value.replace(/[^a-zA-Z\s'-]/g, '');
}

/**
 * Validates name fields (first name, last name, middle name)
 * @param name - The name to validate
 * @param field - Field name for error messages (e.g., "First name")
 * @param isOptional - Whether the field is optional (e.g., middle name)
 * @returns Error message if invalid, empty string if valid
 */
export function validateName(name: string, field: string, isOptional: boolean = false): string {
  const trimmedName = name.trim();

  // If optional and empty, it's valid
  if (isOptional && !trimmedName) return "";

  if (!trimmedName) return `${field} is required`;
  if (trimmedName.length < 2) return `${field} must be at least 2 characters`;
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName))
    return `${field} can only contain letters, spaces, hyphens, and apostrophes`;
  if (/^['-]/.test(trimmedName) || /['-]$/.test(trimmedName))
    return `${field} cannot start or end with a hyphen or apostrophe`;
  if (/\s{2,}/.test(trimmedName))
    return `${field} cannot contain consecutive spaces`;
  if (trimmedName.length > 30)
    return `${field} is too long (max 30 characters)`;

  return "";
}

/**
 * Validates email address with comprehensive checks
 * @param email - The email to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validateEmail(email: string): string {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) return "Email is required";
  if (/\s/.test(trimmedEmail)) return "Email cannot contain spaces";
  if (trimmedEmail.length > 254) return "Email address is too long";

  // Match the backend's standards-based validation without restricting users
  // to a hand-maintained provider allowlist or short TLDs.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) return "Please enter a valid email address";

  const [localPart, domain] = trimmedEmail.split("@");
  if (localPart.length > 64) return "Email username is too long";
  if (localPart.startsWith(".") || localPart.endsWith(".") || /\.{2,}/.test(localPart)) {
    return "Please enter a valid email address";
  }
  if (domain.split(".").some((label) => !label || label.startsWith("-") || label.endsWith("-"))) {
    return "Please enter a valid email domain";
  }

  return "";
}

/**
 * Type definitions for validation errors
 */
export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Helper function to check if passwords match
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Error message if they don't match, empty string if they match
 */
export function validatePasswordMatch(password: string, confirmPassword: string): string {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return "";
}
