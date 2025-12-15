import Notification from "../models/notification.model.js";
import { SUCCESS_MESSAGES } from "../lib/utils/constants.js";
import { sendSuccess, sendMessage } from "../lib/utils/response.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * @desc    Get all notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
	const userId = req.user._id;

	const notifications = await Notification.find({ to: userId }).populate({
		path: "from",
		select: "username profileImg",
	});

	// Mark all as read
	await Notification.updateMany({ to: userId }, { read: true });

	return sendSuccess(res, notifications);
});

/**
 * @desc    Delete all notifications for current user
 * @route   DELETE /api/notifications
 * @access  Private
 */
export const deleteNotifications = asyncHandler(async (req, res) => {
	const userId = req.user._id;

	await Notification.deleteMany({ to: userId });

	return sendMessage(res, SUCCESS_MESSAGES.NOTIFICATIONS_DELETED);
});
