
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/utils/cloudinary.js";

export const signup = async (req, res) => {
	try {
		const { fullName, username, email, password, profileImg } = req.body;

		// Step 1: Validate inputs
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		// Step 2: Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Step 3: Upload image to Cloudinary (if exists)
		let uploadedProfileImg = "";
		if (profileImg) {
			console.log("Uploading image...");
			const uploadRes = await cloudinary.uploader.upload(profileImg, {
				folder: "user_profiles",
			});
			uploadedProfileImg = uploadRes.secure_url;
			console.log("Uploaded Image URL:", uploadedProfileImg);
		}

		// Step 4: Create user
		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
			profileImg: uploadedProfileImg,
		});

		await newUser.save();

		generateTokenAndSetCookie(newUser._id, res);

		// Step 5: Send response
		return res.status(201).json({
			_id: newUser._id,
			fullName: newUser.fullName,
			username: newUser.username,
			email: newUser.email,
			profileImg: newUser.profileImg,
		});
	} catch (err) {
		console.error("Signup error:", err.message);
		return res.status(500).json({ error: "Internal server error" });
	}
};


export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// ✅ Set the cookie with JWT securely
		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", {
			httpOnly: true,
			sameSite: "None",
			secure: true,
			expires: new Date(0), 
		});
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};


export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
