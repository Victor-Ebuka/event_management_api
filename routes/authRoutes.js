import { pool } from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import express from "express";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Registration Endpoint
router.post("/register", async (req, res) => {
  const { username, fullName, email, password } = req.body;

  // check that details are provided
  if (!username || !email || !password || !fullName) {
    return res
      .status(400)
      .json({ error: "Username, Full Name, Email & Password are required!" });
  }

  try {
    // check if user already exists
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User already exists! Please Login" });
    }

    // hash user password and generate other data
    const hashedPassword = await bcrypt.hash(password, 10);
    const date_created = new Date(Date.now()).toJSON().split("T")[0];
    let userRole = "organizer";
    if (req.query.role === "admin") userRole = "admin";

    // add user to database
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, full_name, created_at, role) VALUES ($1, $2, $3, $4, $5, $6)`,
      [username, email, hashedPassword, fullName, date_created, userRole]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Login Endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // check if details are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email & Password are required!" });
  }

  try {
    // check if the user exists in db
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Inavlid credentials!" });
    }

    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!isMatch) {
      return res.status(401).json({ error: "Inavlid credentials!" });
    }

    // sign the user with a secret and generate a token
    const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Protected Endpoint
router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  // check that an auth token is in the request header
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // decode the token and check its authenticity
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await pool.query(
      `SELECT id, username, email, full_name, created_at, role FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid token!" });
    }

    res.json(user.rows[0]);
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
