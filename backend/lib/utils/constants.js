// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Default Profile Avatar - Generic faceless silhouette
export const DEFAULT_AVATAR = "https://api.dicebear.com/9.x/shapes/svg?seed=default&backgroundColor=0ea5e9,8b5cf6,ec4899&shape1Color=1e3a5f&shape2Color=374151&shape3Color=4b5563";

// Default Cover Image
export const DEFAULT_COVER = "";

// Error Messages
export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: "Invalid username or password",
  USER_NOT_FOUND: "User not found",
  USERNAME_TAKEN: "Username is already taken",
  EMAIL_TAKEN: "Email is already taken",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters long",
  PASSWORD_TOO_SIMILAR: "Password is too similar to username or email",
  PASSWORDS_MISMATCH: "Please provide both current and new password",
  CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",
  
  // Post errors
  POST_NOT_FOUND: "Post not found",
  POST_EMPTY: "Post must have text or image",
  UNAUTHORIZED_DELETE: "You are not authorized to delete this post",
  COMMENT_EMPTY: "Text field is required",
  
  // User errors
  CANNOT_FOLLOW_SELF: "You can't follow/unfollow yourself",
  
  // Generic errors
  INTERNAL_SERVER_ERROR: "Internal server error",
  UNAUTHORIZED: "Unauthorized - Please login",
  MISSING_FIELDS: "Please fill in all required fields",
  INVALID_EMAIL: "Please provide a valid email address",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGOUT_SUCCESS: "Logged out successfully",
  POST_DELETED: "Post deleted successfully",
  USER_FOLLOWED: "User followed successfully",
  USER_UNFOLLOWED: "User unfollowed successfully",
  NOTIFICATIONS_DELETED: "Notifications deleted successfully",
};

// Cookie Configuration
export const COOKIE_CONFIG = {
  NAME: "jwt",
  MAX_AGE: 15 * 24 * 60 * 60 * 1000, // 15 days
  getOptions: () => ({
    maxAge: COOKIE_CONFIG.MAX_AGE,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  }),
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  BIO_MAX_LENGTH: 200,
};
