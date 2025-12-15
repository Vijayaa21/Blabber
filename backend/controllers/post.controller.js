import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/utils/cloudinary.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../lib/utils/constants.js";
import {
  sendSuccess,
  sendCreated,
  sendMessage,
  sendNotFound,
  sendBadRequest,
  sendUnauthorized,
} from "../lib/utils/response.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Helper function to add likeCount to posts
const addLikeCount = (posts) => {
  return posts.map((post) => ({
    ...post.toObject(),
    likeCount: post.likes.length,
  }));
};

// Common populate options for posts
const postPopulateOptions = [
  { path: "user", select: "-password" },
  { path: "comments.user", select: "-password" },
];

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req, res) => {
  const { text } = req.body;
  let { img } = req.body;
  const userId = req.user._id.toString();

  const user = await User.findById(userId);
  if (!user) {
    return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  if (!text && !img) {
    return sendBadRequest(res, ERROR_MESSAGES.POST_EMPTY);
  }

  if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    img = uploadedResponse.secure_url;
  }

  const newPost = new Post({
    user: userId,
    text,
    img,
  });

  await newPost.save();
  return sendCreated(res, newPost);
});

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return sendNotFound(res, ERROR_MESSAGES.POST_NOT_FOUND);
  }

  if (post.user.toString() !== req.user._id.toString()) {
    return sendUnauthorized(res, ERROR_MESSAGES.UNAUTHORIZED_DELETE);
  }

  if (post.img) {
    const imgId = post.img.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imgId);
  }

  await Post.findByIdAndDelete(req.params.id);
  return sendMessage(res, SUCCESS_MESSAGES.POST_DELETED);
});

/**
 * @desc    Comment on a post
 * @route   POST /api/posts/comment/:id
 * @access  Private
 */
export const commentOnPost = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const postId = req.params.id;
  const userId = req.user._id;

  if (!text) {
    return sendBadRequest(res, ERROR_MESSAGES.COMMENT_EMPTY);
  }

  const post = await Post.findById(postId);
  if (!post) {
    return sendNotFound(res, ERROR_MESSAGES.POST_NOT_FOUND);
  }

  const comment = { user: userId, text };
  post.comments.push(comment);
  await post.save();

  // Send notification for comment (don't notify yourself)
  if (post.user.toString() !== userId.toString()) {
    const notification = new Notification({
      from: userId,
      to: post.user,
      type: "comment",
      post: postId,
    });
    await notification.save();
  }

  // Re-fetch the post with populated comments
  const updatedPost = await Post.findById(postId).populate(postPopulateOptions);

  return sendSuccess(res, updatedPost);
});

/**
 * @desc    Like or unlike a post
 * @route   POST /api/posts/like/:id
 * @access  Private
 */
export const likeUnlikePost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    return sendNotFound(res, ERROR_MESSAGES.POST_NOT_FOUND);
  }

  const userLikedPost = post.likes.includes(userId);

  if (userLikedPost) {
    // Unlike post
    await Promise.all([
      Post.updateOne({ _id: postId }, { $pull: { likes: userId } }),
      User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } }),
    ]);

    const updatedLikes = post.likes.filter(
      (id) => id.toString() !== userId.toString()
    );
    return sendSuccess(res, { likes: updatedLikes, likeCount: updatedLikes.length });
  } else {
    // Like post
    post.likes.push(userId);
    await Promise.all([
      User.updateOne({ _id: userId }, { $push: { likedPosts: postId } }),
      post.save(),
    ]);

    // Create notification (don't notify yourself)
    if (post.user.toString() !== userId.toString()) {
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
    }

    return sendSuccess(res, { likes: post.likes, likeCount: post.likes.length });
  }
});

/**
 * @desc    Get all posts
 * @route   GET /api/posts/all
 * @access  Public
 */
export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate(postPopulateOptions);

  if (posts.length === 0) {
    return sendSuccess(res, []);
  }

  return sendSuccess(res, addLikeCount(posts));
});

/**
 * @desc    Get posts liked by a user
 * @route   GET /api/posts/likes/:id
 * @access  Public
 */
export const getLikedPosts = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
    .populate(postPopulateOptions);

  return sendSuccess(res, addLikeCount(likedPosts));
});

/**
 * @desc    Get posts from users the current user follows
 * @route   GET /api/posts/following
 * @access  Private
 */
export const getFollowingPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const feedPosts = await Post.find({ user: { $in: user.following } })
    .sort({ createdAt: -1 })
    .populate(postPopulateOptions);

  return sendSuccess(res, addLikeCount(feedPosts));
});

/**
 * @desc    Get posts by username
 * @route   GET /api/posts/user/:username
 * @access  Public
 */
export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) {
    return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate(postPopulateOptions);

  return sendSuccess(res, addLikeCount(posts));
});

/**
 * @desc    Update a post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
export const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { text, img } = req.body;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    return sendNotFound(res, ERROR_MESSAGES.POST_NOT_FOUND);
  }

  if (post.user.toString() !== userId.toString()) {
    return sendUnauthorized(res, "Unauthorized to edit this post");
  }

  let updatedImg = post.img;
  if (img && img !== post.img) {
    // Delete old image from Cloudinary
    if (post.img) {
      const publicId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    const uploadedResponse = await cloudinary.uploader.upload(img);
    updatedImg = uploadedResponse.secure_url;
  }

  post.text = text || post.text;
  post.img = updatedImg;
  await post.save();

  return sendSuccess(res, { message: "Post updated successfully", post });
});

/**
 * @desc    Delete a comment
 * @route   DELETE /api/posts/:postId/comment/:commentId
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    return sendNotFound(res, ERROR_MESSAGES.POST_NOT_FOUND);
  }

  const comment = post.comments.find((c) => c._id.toString() === commentId);
  if (!comment) {
    return sendNotFound(res, "Comment not found");
  }

  // Allow comment owner or post owner to delete
  if (
    comment.user.toString() !== userId.toString() &&
    post.user.toString() !== userId.toString()
  ) {
    return sendUnauthorized(res, "Unauthorized to delete this comment");
  }

  post.comments = post.comments.filter((c) => c._id.toString() !== commentId);
  await post.save();

  return sendMessage(res, "Comment deleted successfully");
});

/**
 * @desc    Get a single post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id).populate(postPopulateOptions);

  if (!post) {
    return sendNotFound(res, ERROR_MESSAGES.POST_NOT_FOUND);
  }

  return sendSuccess(res, {
    ...post.toObject(),
    likeCount: post.likes.length,
  });
});

/**
 * @desc    Edit a comment
 * @route   PUT /api/posts/:postId/comment/:commentId
 * @access  Private
 */
export const editComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return sendBadRequest(res, "Comment text cannot be empty");
  }

  const post = await Post.findById(postId);
  if (!post) {
    return sendNotFound(res, ERROR_MESSAGES.POST_NOT_FOUND);
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    return sendNotFound(res, "Comment not found");
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    return sendUnauthorized(res, "You are not allowed to edit this comment");
  }

  comment.text = text;
  await post.save();

  return sendSuccess(res, { message: "Comment updated successfully", comment });
});

/**
 * @desc    Bookmark or unbookmark a post
 * @route   POST /api/posts/bookmark/:id
 * @access  Private
 */
export const bookmarkPost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    return sendNotFound(res, ERROR_MESSAGES.POST_NOT_FOUND);
  }

  const isBookmarked = post.bookmarks.includes(userId);

  if (isBookmarked) {
    // Remove bookmark
    await Promise.all([
      Post.updateOne({ _id: postId }, { $pull: { bookmarks: userId } }),
      User.updateOne({ _id: userId }, { $pull: { bookmarkedPosts: postId } }),
    ]);

    return sendSuccess(res, { 
      bookmarked: false, 
      message: "Post removed from bookmarks",
      bookmarkCount: post.bookmarks.length - 1
    });
  } else {
    // Add bookmark
    await Promise.all([
      Post.updateOne({ _id: postId }, { $push: { bookmarks: userId } }),
      User.updateOne({ _id: userId }, { $push: { bookmarkedPosts: postId } }),
    ]);

    return sendSuccess(res, { 
      bookmarked: true, 
      message: "Post bookmarked",
      bookmarkCount: post.bookmarks.length + 1
    });
  }
});

/**
 * @desc    Get bookmarked posts for a user
 * @route   GET /api/posts/bookmarks/:id
 * @access  Private
 */
export const getBookmarkedPosts = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const bookmarkedPosts = await Post.find({ _id: { $in: user.bookmarkedPosts } })
    .sort({ createdAt: -1 })
    .populate(postPopulateOptions);

  return sendSuccess(res, addLikeCount(bookmarkedPosts));
});

/**
 * @desc    Repost a post
 * @route   POST /api/posts/repost/:id
 * @access  Private
 */
export const repostPost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    return sendNotFound(res, ERROR_MESSAGES.POST_NOT_FOUND);
  }

  const hasReposted = post.reposts.includes(userId);

  if (hasReposted) {
    // Remove repost
    await Post.updateOne({ _id: postId }, { $pull: { reposts: userId } });

    return sendSuccess(res, { 
      reposted: false, 
      message: "Repost removed",
      repostCount: post.reposts.length - 1
    });
  } else {
    // Add repost
    await Post.updateOne({ _id: postId }, { $push: { reposts: userId } });

    // Create notification for repost (don't notify yourself)
    if (post.user.toString() !== userId.toString()) {
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "repost",
      });
      await notification.save();
    }

    return sendSuccess(res, { 
      reposted: true, 
      message: "Post reposted",
      repostCount: post.reposts.length + 1
    });
  }
});
