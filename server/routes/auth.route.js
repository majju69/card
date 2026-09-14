import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updatePassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.use(protectRoute);

router.post("/update-password", updatePassword);
router.get("/check", checkAuth);

export default router;
