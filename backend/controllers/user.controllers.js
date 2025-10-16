import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";


export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};


export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			// Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};


export const getSuggestedUsers = async (req, res) => {
	try{
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				}
			},
			{
				$sample: { size: 10 } // Get 10 random users
			},
		])

		const filteredUsers =  users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);
		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);

	} catch (error) {
	
	}
}

export const updateUserProfile = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Password change logic - available for all users
    if (currentPassword && newPassword) {
      // For Google OAuth users, they can set a new password directly
      if (user.password === "google") {
        // Google OAuth user setting password for the first time
        if (newPassword.length < 6) {
          return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
      } else {
        // Regular user - verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
        if (newPassword.length < 6) {
          return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
      }
    } else if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ message: "Please provide both current and new password" });
    }

    // Handle profile image upload
    if (profileImg && profileImg !== user.profileImg) {
      // Delete old profile image from cloudinary if it exists and is not the default
      if (user.profileImg && !user.profileImg.includes("default") && !user.profileImg.includes("googleusercontent")) {
        try {
          const publicId = user.profileImg.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.log("Error deleting old profile image:", cloudinaryError.message);
        }
      }
      
      // Upload new profile image
      try {
        const uploadedResponse = await cloudinary.uploader.upload(profileImg);
        profileImg = uploadedResponse.secure_url;
      } catch (uploadError) {
        console.log("Error uploading profile image:", uploadError.message);
        return res.status(400).json({ message: "Error uploading profile image" });
      }
    } else {
      // Keep the existing profile image
      profileImg = user.profileImg;
    }

    // Handle cover image upload - FIXED THIS PART
    if (coverImg) {
      // If coverImg is provided and it's different from current one, or if it's empty string (to remove cover)
      if (coverImg !== user.coverImg) {
        // Delete old cover image from cloudinary if it exists
        if (user.coverImg && !user.coverImg.includes("default")) {
          try {
            const publicId = user.coverImg.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.log("Error deleting old cover image:", cloudinaryError.message);
          }
        }
        
        // If coverImg is not empty, upload new one
        if (coverImg.trim() !== "") {
          try {
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
          } catch (uploadError) {
            console.log("Error uploading cover image:", uploadError.message);
            return res.status(400).json({ message: "Error uploading cover image" });
          }
        } else {
          // If coverImg is empty string, set to empty (remove cover)
          coverImg = "";
        }
      }
    } else {
      // Keep the existing cover image
      coverImg = user.coverImg;
    }

    // Check if username or email already exists (excluding current user)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already taken" });
      }
    }

    // Update user fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg;
    user.coverImg = coverImg;

    user = await user.save();

    // Remove password from response
    user.password = undefined;

    return res.status(200).json(user);

  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

	
// GET /api/users/:id/followers
export const getFollowers = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).populate(
			'followers',
			'username fullName profileImg'
		);

		if (!user) return res.status(404).json({ message: 'User not found' });

		res.status(200).json(user.followers);
	} catch (error) {
		console.log('Error in getFollowers: ', error.message);
		res.status(500).json({ error: error.message });
	}
};

// GET /api/users/:id/following
export const getFollowing = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).populate(
			'following',
			'username fullName profileImg'
		);

		if (!user) return res.status(404).json({ message: 'User not found' });

		res.status(200).json(user.following);
	} catch (error) {
		console.log('Error in getFollowing: ', error.message);
		res.status(500).json({ error: error.message });
	}
};



	
