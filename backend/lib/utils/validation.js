import { VALIDATION } from "./constants.js";

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if password is too similar to username or email
 */
export const isPasswordTooSimilar = (password, username, email) => {
  const lowerPassword = password.toLowerCase();
  const lowerUsername = username.toLowerCase();
  const emailPrefix = email.split("@")[0].toLowerCase();

  return (
    lowerPassword.includes(lowerUsername) ||
    lowerUsername.includes(lowerPassword) ||
    lowerPassword.includes(emailPrefix) ||
    emailPrefix.includes(lowerPassword)
  );
};

/**
 * Validate password strength
 */
export const validatePassword = (password, username, email) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
  } else {
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (isPasswordTooSimilar(password, username, email)) {
      errors.push("Password is too similar to username or email");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate username format
 */
export const validateUsername = (username) => {
  const errors = [];

  if (!username) {
    errors.push("Username is required");
  } else {
    if (username.length < VALIDATION.USERNAME_MIN_LENGTH) {
      errors.push(`Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`);
    }
    if (username.length > VALIDATION.USERNAME_MAX_LENGTH) {
      errors.push(`Username must be less than ${VALIDATION.USERNAME_MAX_LENGTH} characters`);
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push("Username can only contain letters, numbers, and underscores");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate signup fields
 */
export const validateSignupFields = (data) => {
  const { username, fullName, email, password } = data;
  const errors = [];

  if (!username || !fullName || !email || !password) {
    errors.push("All fields are required");
    return { isValid: false, errors };
  }

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    errors.push(...usernameValidation.errors);
  }

  if (!isValidEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  const passwordValidation = validatePassword(password, username, email);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize user object (remove sensitive fields)
 */
export const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  return userObject;
};
