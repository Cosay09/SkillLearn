import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

// Must be last
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
