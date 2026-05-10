import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/history", async (req, res) => {
  try {
    const userId = req.body.userId;

    const deployments = await prisma.deploymentHistory.findMany({
      where: {
        userId: userId,
      },
    });

    if (deployments.length > 0) {
      res.status(200).json({
        deployments,
      });
    }
  } catch (err) {
    console.error("Error while fetching deployment history");
  }
});
