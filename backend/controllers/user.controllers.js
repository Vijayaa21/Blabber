import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
import { 
  HTTP_STATUS, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from "../lib/utils/constants.js";
import { 
  sendSuccess, 
  sendError, 
  sendMessage, 
  sendNotFound, 
  sendBadRequest 
} from "../lib/utils/response.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * @desc    Get user profile by username
 * @route   GET /api/users/profile/:username
 * @access  Public
 */
export const getUserProfile = asyncHandler(async (req, res) => {
	const { username } = req.params;

	const user = await User.findOne({ username }).select("-password");
	if (!user) {
		return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
	}

	return sendSuccess(res, user);
});

/**
 * @desc    Follow or unfollow a user
 * @route   POST /api/users/follow/:id
 * @access  Private
 */
export const followUnfollowUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const currentUserId = req.user._id;

	if (id === currentUserId.toString()) {
		return sendBadRequest(res, ERROR_MESSAGES.CANNOT_FOLLOW_SELF);
	}

	const [userToModify, currentUser] = await Promise.all([
		User.findById(id),
		User.findById(currentUserId),
	]);

	if (!userToModify || !currentUser) {
		return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
	}

	const isFollowing = currentUser.following.includes(id);

	if (isFollowing) {
		// Unfollow the user
		await Promise.all([
			User.findByIdAndUpdate(id, { $pull: { followers: currentUserId } }),
			User.findByIdAndUpdate(currentUserId, { $pull: { following: id } }),
		]);

		return sendMessage(res, SUCCESS_MESSAGES.USER_UNFOLLOWED);
	} else {
		// Follow the user
		await Promise.all([
			User.findByIdAndUpdate(id, { $push: { followers: currentUserId } }),
			User.findByIdAndUpdate(currentUserId, { $push: { following: id } }),
		]);

		// Send notification
		const newNotification = new Notification({
			type: "follow",
			from: currentUserId,
			to: userToModify._id,
		});
		await newNotification.save();

		return sendMessage(res, SUCCESS_MESSAGES.USER_FOLLOWED);
	}
});

/**
 * @desc    Get suggested users to follow
 * @route   GET /api/users/suggested
 * @access  Private
 */
export const getSuggestedUsers = asyncHandler(async (req, res) => {
	const userId = req.user._id;

	const usersFollowedByMe = await User.findById(userId).select("following");

	const users = await User.aggregate([
		{ $match: { _id: { $ne: userId } } },
		{ $sample: { size: 10 } },
		{ $project: { password: 0 } },
	]);

	const filteredUsers = users.filter(
		(user) => !usersFollowedByMe.following.includes(user._id)
	);
	const suggestedUsers = filteredUsers.slice(0, 4);

	return sendSuccess(res, suggestedUsers);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/update
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;
	const userId = req.user._id;

	let user = await User.findById(userId);
	if (!user) {
		return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
	}

	// Password update validation
	if ((!currentPassword && newPassword) || (!newPassword && currentPassword)) {
		return sendBadRequest(res, ERROR_MESSAGES.PASSWORDS_MISMATCH);
	}

	if (currentPassword && newPassword) {
		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			return sendBadRequest(res, ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT);
		}
		if (newPassword.length < 6) {
			return sendBadRequest(res, ERROR_MESSAGES.PASSWORD_TOO_SHORT);
		}
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);
	}

	// Handle profile image update
	if (profileImg) {
		// Delete old image from Cloudinary
		if (user.profileImg) {
			const oldImageId = user.profileImg.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(oldImageId);
		}
		const uploadedResponse = await cloudinary.uploader.upload(profileImg);
		profileImg = uploadedResponse.secure_url;
	}

	// Handle cover image update
	if (coverImg) {
		if (user.coverImg) {
			const oldCoverId = user.coverImg.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(oldCoverId);
		}
		const uploadedResponse = await cloudinary.uploader.upload(coverImg);
		coverImg = uploadedResponse.secure_url;
	}

	// Update user fields
	user.fullName = fullName || user.fullName;
	user.email = email || user.email;
	user.username = username || user.username;
	user.bio = bio !== undefined ? bio : user.bio;
	user.link = link !== undefined ? link : user.link;
	user.profileImg = profileImg || user.profileImg;
	user.coverImg = coverImg || user.coverImg;

	user = await user.save();
	user.password = null;

	return sendSuccess(res, user);
});

/**
 * @desc    Get user's followers
 * @route   GET /api/users/:id/followers
 * @access  Public
 */
export const getFollowers = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).populate(
		"followers",
		"username fullName profileImg"
	);

	if (!user) {
		return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
	}

	return sendSuccess(res, user.followers);
});

/**
 * @desc    Get users the user is following
 * @route   GET /api/users/:id/following
 * @access  Public
 */
export const getFollowing = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).populate(
		"following",
		"username fullName profileImg"
	);

	if (!user) {
		return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
	}

	return sendSuccess(res, user.following);
});



	
