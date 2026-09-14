import mongoose from "mongoose";
import { MEALS } from "../lib/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    meal: {
      type: String,
      required: true,
      lowercase: true,
      enum: MEALS,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null,
    },
    paid: {
      type: Boolean,
      default: false,
      required: true,
    },
    bookedBy: {
      type: String,
      enum: ["user", "admin"],
    },
    note: { type: String },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ date: 1, meal: 1 }, { unique: true });
bookingSchema.index({ user: 1, date: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
