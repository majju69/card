import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`\nMongoDB connected : ${conn.connection.host}\n`);
  } catch (error) {
    console.log("\nMongoDB connection error :", error);
  }
};
