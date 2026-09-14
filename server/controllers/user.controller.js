import User from "../models/user.model.js";

// Admin-only. Powers the "book for a student" picker in the admin panel.
export const adminGetUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("fullName email isAdmin")
      .sort({ fullName: 1 })
      .lean();
    res.status(200).json({ users });
  } catch (error) {
    console.log("Error in adminGetUsers controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
