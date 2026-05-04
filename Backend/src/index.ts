import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

const JWT_SECRET = process.env.JWT_SECRET!;

app.post("/signup", async (req, res) => {
  try {
    const { name, password, email } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    const user = await prisma.user.create({
      data: { email, password, name },
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/logout", (req, res) => {
  res
    .status(200)
    .json({ message: "Logged out — delete the token on client side" });
});

app.listen(8080, () => console.log("Server running on port 8080"));
