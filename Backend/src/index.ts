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

function protectRouteMiddleware(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Login / Signup to use the service",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

app.get("/landing", protectRouteMiddleware, (req, res) => {
  res.status(200).json({
    message: "Welcome to DeployX",
  });
});

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
    res
      .status(201)
      .json({ message: "User created successfully", name: user.name });
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
      expiresIn: "5d",
    });
    res.status(200).json({ token, name: user.name });
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
