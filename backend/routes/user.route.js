import express from "express";  
import { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUserProfile, getFollowers,getFollowing } from "../controllers/user.controllers.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update",protectRoute, updateUserProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

export default router;