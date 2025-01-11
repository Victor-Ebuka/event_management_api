import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import eventsRouter from "./routes/eventsRoute.js";
import authRouter from "./routes/authRoutes.js";

// import env data
dotenv.config();

// initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routes
app.use("/api/events", eventsRouter);
app.use("/api/auth", authRouter);

// test server
app.get("/", (req, res) => {
  res.send("Server running...");
});

// listen for requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
