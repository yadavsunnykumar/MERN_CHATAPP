import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./lib/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  // Serve frontend static files
  app.use(express.static(path.join(__dirname, "frontend/dist")));

  // Handle any route by serving index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server is running on port 5001");
  connectDB();
});
