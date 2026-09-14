import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import bookingRoutes from "./routes/booking.route.js";
import path from "path";

import { connectDB } from "./lib/db.js";
import morgan from "morgan";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.all("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`\nServer is running on PORT : ${PORT}\n`);
  connectDB();
});
