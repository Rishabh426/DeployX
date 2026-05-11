import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.post("/history", async (req, res) => {
    const { id, userId, repoUrl, status, deployedUrl, timeTaken } = req.body;
    try {
        const deployment = await prisma.deployment.upsert({
            where: { id },
            update: { status, deployedUrl, timeTaken },
            create: { id, userId, repoUrl, status, deployedUrl, timeTaken },
        });
        res.json(deployment);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save deployment" });
    }
});
app.get("/history/:userId", async (req, res) => {
    try {
        const deployments = await prisma.deployment.findMany({
            where: { userId: req.params.userId },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
        res.json({ deployments });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch deployments" });
    }
});
app.listen(4000, () => console.log("History service on port 4000"));
