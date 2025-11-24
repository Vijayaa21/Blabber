import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
	const isProd = process.env.NODE_ENV === "production";

	res.cookie("jwt", token, {
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
		httpOnly: true,       // 🛡️ Protects from XSS
		sameSite: isProd ? "None" : "Lax",
		secure: isProd,
	});
};
