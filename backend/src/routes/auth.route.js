import express from "express";

import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
// These are the routes for the signup,login and logout functions
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Routes to update profile by user
router.put("/update-profile", protectRoute, updateProfile);

router.get('/check',protectRoute,checkAuth) 

export default router;
