import mongoose from "mongoose";
import { DEFAULT_AVATAR } from "../lib/utils/constants.js";

// Generate a unique default avatar based on username
const generateDefaultAvatar = (username) => {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username || 'user')}&backgroundColor=0ea5e9,8b5cf6,ec4899,f59e0b,10b981&fontFamily=Arial&fontSize=40`;
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: [3, "Username must be at least 3 characters"],
      maxLength: [20, "Username must be less than 20 characters"],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    bookmarkedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

// Virtual field to return a default avatar if profileImg is empty
userSchema.virtual('avatarUrl').get(function() {
  if (this.profileImg && this.profileImg.length > 0) {
    return this.profileImg;
  }
  // Generate initials-based avatar from DiceBear
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(this.username || 'user')}&backgroundColor=0ea5e9,8b5cf6,ec4899,f59e0b,10b981&fontFamily=Arial&fontSize=40`;
});

// Ensure virtuals are included when converting to JSON/Object
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Index for faster queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);
export default User;
