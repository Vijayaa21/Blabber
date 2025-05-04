import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute  = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        // Verify the token and extract user information
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        const user = await User.findById(decoded.userId).select("-password");
         
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        req.user = user; // Attach user to request object   
        next(); // Call next middleware or route handler

    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
}