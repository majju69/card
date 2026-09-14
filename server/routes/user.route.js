import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { adminGetUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, adminGetUsers);

export default router;
