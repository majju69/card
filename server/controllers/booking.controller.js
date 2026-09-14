import mongoose from "mongoose";
import { MEALS, MAX_ADVANCE_DAYS } from "../lib/constants.js";
import { getTodayIST, addDays } from "../lib/date.js";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";

export const createBooking = async (req, res) => {
  try {
    const user = req.user;
    const { date, meal } = req.body;
    const today = addDays(getTodayIST(), 0);
    if (!date || !meal) {
      return res
        .status(400)
        .json({ message: "Both date and meal are required" });
    }
    if (!MEALS.includes(meal)) {
      return res.status(400).json({ message: "Invalid meal type" });
    }
    let bookingDate;
    try {
      bookingDate = addDays(date, 0);
    } catch {
      return res
        .status(400)
        .json({ message: "Invalid date, expected YYYY-MM-DD" });
    }
    // console.log(user);
    if (!user.isAdmin) {
      if (bookingDate > addDays(today, MAX_ADVANCE_DAYS)) {
        return res.status(400).json({
          message: `Cannot book a meal more than ${MAX_ADVANCE_DAYS} days in advance`,
        });
      }
      if (bookingDate < today) {
        return res.status(400).json({ message: "Cannot book a past meal" });
      }
    }
    const newBooking = new Booking({
      date: bookingDate,
      meal,
      user: user._id,
      bookedBy: user.isAdmin ? "admin" : "user",
    });
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    console.log("Error in createBooking controller", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Meal already booked" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const today = getTodayIST();
    const from = today;
    const to = addDays(today, MAX_ADVANCE_DAYS);
    const userId = req.user._id.toString();
    const bookings = await Booking.find({ date: { $gte: from, $lte: to } })
      .populate("user", "fullName")
      .lean();
    const bySlot = new Map();
    for (const b of bookings) bySlot.set(`${b.date}|${b.meal}`, b);
    const days = [];
    let cursor = from;
    while (cursor <= to) {
      const meals = {};
      for (const meal of MEALS) {
        const row = bySlot.get(`${cursor}|${meal}`);
        let status;
        if (!row) status = "free";
        else if (!row.user) status = "blocked";
        else status = "booked";
        meals[meal] = {
          status,
          mine: row?.user?._id?.toString() === userId,
        };
        if (row?.user) meals[meal].bookedBy = row.user.fullName;
      }
      days.push({ date: cursor, meals });
      cursor = addDays(cursor, 1);
    }
    res.status(200).json({ today, maxBookableDate: to, days });
  } catch (error) {
    console.log("Error in getAvailability controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// !! If this gets slow, add a limit — but then `unpaid` must become its own query (countDocuments or a find with paid:false), because filtering a limited array silently drops older unpaid bookings.

export const getMyBookings = async (req, res) => {
  try {
    const user = req.user;
    const bookings = await Booking.find({ user: user._id })
      .sort({ date: -1 })
      .lean()
      .select("-note");
    const unpaid = bookings.filter((x) => !x.paid);
    res.status(200).json({ bookings, unpaid });
  } catch (error) {
    console.log("Error in getMyBookings controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminGetBookings = async (req, res) => {
  try {
    const { from, to, paid, userId } = req.query;
    const filter = {};
    let validFrom;
    let validTo;
    if (paid !== undefined) {
      if (paid !== "true" && paid !== "false") {
        return res.status(400).json({ message: "paid must be true or false" });
      }
      filter.paid = paid === "true";
    }
    try {
      if (from) validFrom = addDays(from, 0);
      if (to) validTo = addDays(to, 0);
    } catch {
      return res
        .status(400)
        .json({ message: "Invalid date, expected YYYY-MM-DD" });
    }
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (userId) filter.user = userId;
    else if (filter.paid === false) filter.user = { $ne: null };
    if (validFrom && validTo && validFrom > validTo) {
      return res.status(400).json({ message: "From can be at most to" });
    }
    if (validFrom || validTo) {
      filter.date = {};
      if (validFrom) filter.date.$gte = validFrom;
      if (validTo) filter.date.$lte = validTo;
    }
    const bookings = await Booking.find(filter)
      .populate("user", "fullName email")
      .sort({ date: -1 })
      .lean();
    const unpaidCount = await Booking.countDocuments({
      paid: false,
      user: { $ne: null },
    });
    res.status(200).json({ bookings, unpaidCount });
  } catch (error) {
    console.log("Error in adminGetBookings controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminCreateBooking = async (req, res) => {
  try {
    const { date, meal, userId, paid, note } = req.body;
    if (!date || !meal) {
      return res
        .status(400)
        .json({ message: "Both date and meal are required" });
    }
    if (!MEALS.includes(meal)) {
      return res.status(400).json({ message: "Invalid meal type" });
    }
    try {
      addDays(date, 0);
    } catch (error) {
      res.status(400).json({ message: "Invalid date, expected YYYY-MM-DD" });
    }
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }
    const newBooking = new Booking({
      date,
      meal,
      user: userId,
      bookedBy: "admin",
      paid: typeof paid === "boolean" ? paid : false,
      note: typeof note === "string" ? note : null,
    });
    await newBooking.save();
    return res.status(201).json(newBooking);
  } catch (error) {
    console.log("Error in adminCreateBooking controller", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Meal already booked" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminUpdateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const { paid, note } = req.body;
    const update = {};
    if (typeof paid === "boolean") {
      update.paid = paid;
    }
    if (typeof note === "string") {
      update.note = note;
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "Update cannot be empty" });
    }
    const booking = await Booking.findByIdAndUpdate(id, update, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json(booking);
  } catch (error) {
    console.log("Error in adminUpdateBooking controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminDeleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json(booking);
  } catch (error) {
    console.log("Error in adminDeleteBooking controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
