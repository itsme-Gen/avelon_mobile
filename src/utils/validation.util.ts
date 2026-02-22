// Password requirements from backend
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  startsWithUppercase: /^[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[^A-Za-z0-9]/,
  onlyOneUppercase: /^[A-Z][^A-Z]*$/,
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
  if (!PASSWORD_REQUIREMENTS.startsWithUppercase.test(password)) {
    return "Password must start with an uppercase letter";
  }
  if (!PASSWORD_REQUIREMENTS.onlyOneUppercase.test(password)) {
    return "Password must have only one uppercase letter at the start";
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
  if (PASSWORD_REQUIREMENTS.startsWithUppercase.test(password) && PASSWORD_REQUIREMENTS.onlyOneUppercase.test(password)) strength++;
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

  // Check for spaces
  if (/\s/.test(trimmedEmail)) return "Email cannot contain spaces";

  // Check for consecutive dots
  if (/\.{2,}/.test(trimmedEmail))
    return "Email cannot contain consecutive dots";

  // More comprehensive email regex (RFC 5322 compliant)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail))
    return "Please enter a valid email address";

  // Check that local part doesn't start/end with dot
  const [localPart, domain] = trimmedEmail.split("@");
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return "Email local part cannot start or end with a dot";
  }

  // Check local part length
  if (localPart.length < 1) return "Email local part is too short";
  if (localPart.length > 30)
    return "Email local part is too long (max 30 characters)";

  // Check that local part contains only allowed characters: letters, numbers, dot, hyphen, underscore, plus
  if (!/^[a-zA-Z0-9._\-+]+$/.test(localPart)) {
    return "Email username can only contain letters, numbers, dots, hyphens, underscores, and plus signs";
  }

  // Check if it's at least 6 characters
  if (localPart.length < 6) {
    return "Email username must be at least 6 characters";
  }

  // Check that special characters are not at the start
  if (/^[._\-+]/.test(localPart)) {
    return "Email username cannot start with special characters";
  }

  // Check for consecutive special characters (no --, .., __, or ++)
  if (/\.{2,}|_{2,}|-{2,}\+{2,}/.test(localPart)) {
    return "Email username cannot contain consecutive special characters";
  }

  // Alternative check for any two consecutive special chars
  if (/[._\-+]{2,}/.test(localPart)) {
    return "Email username cannot contain consecutive special characters";
  }

  // Check that only ONE type of special character is used (not mixed)
  const hasDots = /\./.test(localPart);
  const hasHyphens = /-/.test(localPart);
  const hasUnderscores = /_/.test(localPart);
  const hasPlus = /\+/.test(localPart);

  const specialCharCount = [
    hasDots,
    hasHyphens,
    hasUnderscores,
    hasPlus,
  ].filter(Boolean).length;
  if (specialCharCount > 1) {
    return "Email username cannot mix different special characters. Use only one type (dots, hyphens, underscores, or plus signs).";
  }

  // Check that domain doesn't start/end with hyphen
  if (domain.startsWith("-") || domain.endsWith("-")) {
    return "Email domain cannot start or end with a hyphen";
  }

  // Check for at least one dot in domain
  if (!domain.includes("."))
    return "Email domain must contain at least one dot";

  // Split domain into parts
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];

  // Check TLD requirements
  if (tld.length < 2)
    return "Email domain extension must be at least 2 characters";
  if (tld.length > 6) return "Email domain extension is too long";
  if (!/^[a-zA-Z]+$/.test(tld))
    return "Email domain extension must contain only letters";

  // Allowed email provider domains
  const allowedDomains = [
    // Gmail
    "gmail.com",
    "googlemail.com",
    // Yahoo
    "yahoo.com",
    "yahoo.co.uk",
    "yahoo.co.in",
    "yahoo.fr",
    "yahoo.de",
    "yahoo.es",
    "yahoo.it",
    "yahoo.ca",
    "yahoo.com.br",
    // Outlook / Hotmail
    "outlook.com",
    "outlook.de",
    "outlook.fr",
    "outlook.it",
    "outlook.es",
    "outlook.co.uk",
    "hotmail.com",
    "hotmail.de",
    "hotmail.fr",
    "hotmail.it",
    "hotmail.es",
    "hotmail.co.uk",
    "live.com",
    // AOL
    "aol.com",
    // ProtonMail
    "protonmail.com",
    "proton.me",
    // iCloud
    "icloud.com",
    "me.com",
    "mac.com",
    // Microsoft
    "microsoft.com",
    // Mail.com
    "mail.com",
    // Zoho Mail
    "zoho.com",
    // Yandex
    "yandex.com",
    "yandex.ru",
    // GMX
    "gmx.com",
    "gmx.de",
    "gmx.fr",
    "gmx.es",
    "gmx.it",
    "gmx.co.uk",
    // Web.de
    "web.de",
    // Mail.ru
    "mail.ru",
    // Other common providers
    "fastmail.com",
    "fastmail.fm",
    "posteo.de",
    "tutanota.com",
    "tutamail.com",
    "lavmail.com",
    "inbox.com",
    "mailbox.org",
    "mailfence.com",
    // Educational Institutions - Philippines
    "phinmaed.com", // PhinMA Education
    "up.edu.ph", // University of the Philippines
    "ateneo.edu.ph", // Ateneo de Manila University
    "dlsu.edu.ph", // De La Salle University
    "admu.edu.ph", // Ateneo de Manila University
    "ustp.edu.ph", // University of Science and Technology of the Philippines
    "pnu.edu.ph", // Philippine Normal University
    "cit.edu", // Cebu Institute of Technology
    "tu.edu.ph", // Technological University of the Philippines
    "mapua.edu.ph", // Mapúa Institute of Technology
    "feu.edu.ph", // Far Eastern University
    "adamson.edu.ph", // Adamson University
    "nu.edu.ph", // National University
    // International Educational Institutions
    "edu.au", // Australia
    "ac.uk", // United Kingdom
    "edu.sg", // Singapore
    "ac.jp", // Japan
    "edu.in", // India
    "edu.my", // Malaysia
    "edu.th", // Thailand
    "student.edu.ph", // General student email
  ];

  // Check if domain is in allowed list
  if (!allowedDomains.includes(domain)) {
    return `Email domain "${domain}" is not supported.`;
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