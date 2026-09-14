import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  adminCreateBooking,
  adminDeleteBooking,
  adminGetBookings,
  adminUpdateBooking,
  createBooking,
  getAvailability,
  getMyBookings,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/create", createBooking);
router.get("/availability", getAvailability);
router.get("/me", getMyBookings);

router.use(adminRoute);

router.get("/admin", adminGetBookings);
router.post("/admin", adminCreateBooking);
router.patch("/admin/:id", adminUpdateBooking);
router.delete("/admin/:id", adminDeleteBooking);

export default router;
