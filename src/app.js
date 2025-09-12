// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan"; // logging middleware
import userRoutes from "./routes/userRoutes.js";
import depositRoutes from "./routes/depositRoutes.js";
import withdrawRoutes from "./routes/withdrawRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

// 🔹 Middlewares
app.use(express.json()); // parse JSON
app.use(cors());         // allow cross-origin requests
app.use(morgan("dev"));  // log requests

// 🔹 Routes
app.use("/api/users", userRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/withdraws", withdrawRoutes);
app.use("/api/games", gameRoutes);

// 🔹 Error handling (always at the end)
app.use(errorHandler);

export default app;
