import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT || 5000;

job.start();
app.use(express.json());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use(cors());

// routes
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
// server starter code

app.listen(PORT, () => {
  console.log(`server is runnning on PORT ${PORT}`);
  connectDB();
});
