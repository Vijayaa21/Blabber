// Default avatar generator using DiceBear API
// Generates unique avatars based on username/identifier

/**
 * Generate a default avatar URL using DiceBear's initials style
 * @param {string} identifier - Username or name to generate avatar from
 * @returns {string} - Avatar URL
 */
export const getDefaultAvatar = (identifier = 'user') => {
  const encodedId = encodeURIComponent(identifier);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodedId}&backgroundColor=0ea5e9,8b5cf6,ec4899,f59e0b,10b981&fontFamily=Arial&fontSize=40`;
};

/**
 * Generate a generic faceless avatar (shapes style)
 * @param {string} identifier - Optional seed for unique generation
 * @returns {string} - Avatar URL
 */
export const getGenericAvatar = (identifier = 'default') => {
  const encodedId = encodeURIComponent(identifier);
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodedId}&backgroundColor=1e293b&shape1Color=0ea5e9&shape2Color=8b5cf6&shape3Color=ec4899`;
};

/**
 * Get profile image URL with fallback to default avatar
 * @param {string} profileImg - User's profile image URL
 * @param {string} username - Username for fallback avatar generation
 * @returns {string} - Profile image URL or default avatar
 */
export const getProfileImageUrl = (profileImg, username = 'user') => {
  if (profileImg && profileImg.length > 0) {
    return profileImg;
  }
  return getDefaultAvatar(username);
};

/**
 * Placeholder avatar for signup/form states before user provides image
 */
export const PLACEHOLDER_AVATAR = 'https://api.dicebear.com/9.x/shapes/svg?seed=placeholder&backgroundColor=374151&shape1Color=4b5563&shape2Color=6b7280&shape3Color=9ca3af';
