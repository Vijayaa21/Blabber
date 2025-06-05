import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in ms
		httpOnly: true,       // 🛡️ Protects from XSS
		sameSite: "None",     // ✅ Required for cross-site cookies
		secure: true,         // ✅ Required on HTTPS (like Render)
	});
};
