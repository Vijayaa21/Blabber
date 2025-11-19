import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import cloudinary from "../lib/utils/cloudinary.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

const isPasswordTooSimilar = (password, username, fullName, email) => {
  const loweredPassword = password.toLowerCase();
  const loweredUsername = username.toLowerCase();
  const loweredEmail = email.toLowerCase();
  const loweredFullNameParts = fullName.toLowerCase().split(/\s+/);
  if (loweredPassword.includes(loweredUsername) || loweredPassword.includes(loweredEmail)) {
    return true;
  }
  for (let part of loweredFullNameParts) {
    if (part.length >= 3 && loweredPassword.includes(part)) {
      return true;
    }
  }

  return false;
};
export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password, profileImg } = req.body;

    if (!username || !fullName || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) {
  return res.status(400).json({
    error: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
  });
  }
    if (isPasswordTooSimilar(password, username, fullName, email)) {
      return res.status(400).json({error: "Password cannot contain parts of username, full name, or email"});
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists)
      return res.status(400).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 3: Upload image to Cloudinary (if provided)
    let uploadedProfileImg = "";
    if (profileImg) {
      const uploadRes = await cloudinary.uploader.upload(profileImg, {
        folder: "user_profiles",
      });
      uploadedProfileImg = uploadRes.secure_url;
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

    // Set auth cookie
    generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({ message: "Signup successful", userId: newUser._id });
  } catch (err) {
    console.log("Signup error:", err.message);
    res.status(500).json({ error: "Server Error" });
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


export const logout = (req, res) => {
  try{
        res.cookie('jwt','',{maxAge:0});
        console.log("User logged out");
        res.status(200).json({message:"User logged out"});
    
    } catch (error) {
        console.log("Error in logout controller", error.message );
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

