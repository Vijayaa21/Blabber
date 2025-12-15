import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import cloudinary from "../lib/utils/cloudinary.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { 
  HTTP_STATUS, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  COOKIE_CONFIG 
} from "../lib/utils/constants.js";
import { 
  sendSuccess, 
  sendCreated, 
  sendError, 
  sendMessage, 
  sendBadRequest 
} from "../lib/utils/response.js";
import { isPasswordTooSimilar, isValidEmail } from "../lib/utils/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, profileImg } = req.body;

  // Validate required fields
  if (!username || !fullName || !email || !password) {
    return sendBadRequest(res, ERROR_MESSAGES.MISSING_FIELDS);
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return sendBadRequest(res, ERROR_MESSAGES.INVALID_EMAIL);
  }

  // Validate password strength
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) {
    return sendBadRequest(res, 
      "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character"
    );
  }

  // Check password similarity
  if (isPasswordTooSimilar(password, username, email)) {
    return sendBadRequest(res, ERROR_MESSAGES.PASSWORD_TOO_SIMILAR);
  }

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    const field = userExists.email === email ? "Email" : "Username";
    return sendBadRequest(res, `${field} is already taken`);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Upload profile image to Cloudinary (if provided)
  let uploadedProfileImg = "";
  if (profileImg) {
    const uploadRes = await cloudinary.uploader.upload(profileImg, {
      folder: "user_profiles",
    });
    uploadedProfileImg = uploadRes.secure_url;
  }

  // Create new user
  const newUser = new User({
    fullName,
    username,
    email,
    password: hashedPassword,
    profileImg: uploadedProfileImg,
  });

  await newUser.save();

  // Set auth cookie
  generateTokenAndSetCookie(newUser._id, res);

  return sendCreated(res, {
    _id: newUser._id,
    fullName: newUser.fullName,
    username: newUser.username,
    email: newUser.email,
    profileImg: newUser.profileImg || newUser.avatarUrl,
    coverImg: newUser.coverImg,
    followers: newUser.followers,
    following: newUser.following,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  // Support both `{ username, password }` and `{ emailOrUsername, password }` payloads
  const { username, password, emailOrUsername } = req.body;
  const identifier = (username || emailOrUsername || "").toString().trim();

  if (!identifier || !password) {
    return sendBadRequest(res, "Username/email and password are required");
  }

  const user = await User.findOne({ 
    $or: [{ username: identifier }, { email: identifier }] 
  });
  
  const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

  if (!user || !isPasswordCorrect) {
    return sendBadRequest(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Set the auth cookie
  generateTokenAndSetCookie(user._id, res);

  return sendSuccess(res, {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    followers: user.followers,
    following: user.following,
    profileImg: user.profileImg || user.avatarUrl,
    coverImg: user.coverImg,
    bio: user.bio,
    link: user.link,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    res.clearCookie(COOKIE_CONFIG.NAME, cookieOptions);
    return sendMessage(res, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    return sendError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  
  if (!user) {
    return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return sendSuccess(res, user);
});

