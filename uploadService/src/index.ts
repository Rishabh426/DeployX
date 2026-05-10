import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { createClient } from "redis";
import axios from "axios";

const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const userId = req.body.userId;
  let owner = "";
  let repo = "";

  try {
    const parsedUrl = new URL(repoUrl);

    if (parsedUrl.hostname !== "github.com") {
      res.status(400).json({
        success: false,
        message: "Invalid repository",
      });
      return;
    }

    const parts = parsedUrl.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      res.status(400).json({
        success: false,
        message: "Invalid repository",
      });
      return;
    }

    owner = parts[0];
    repo = parts[1].replace(".git", "");
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid repository",
    });
    return;
  }

  try {
    const githubResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
    );

    if (githubResponse.data.private) {
      res.status(400).json({
        success: false,
        message:
          "Private repositories support is coming in V2. V2 is currently in build phase.",
      });

      return;
    }
  } catch (err: any) {
    if (err?.response?.status === 404) {
      res.status(400).json({
        success: false,
        message:
          "Private repositories support is coming in V2. V2 is currently in build phase.",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid repository",
      });
    }

    return;
  }
  const id = generate();

  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
  const file = getAllFiles(path.join(__dirname, `output/${id}`));

  await Promise.all(
    file.map((file) => uploadFile(file.slice(__dirname.length + 1), file)),
  );

  publisher.lPush("build-queue", id);

  publisher.hSet("status", id, "uploaded");

  await publisher.hSet(`deployment:${id}`, {
    id,
    repoUrl,
    userId,
    status: "uploaded",
    createdAt: Date.now().toString(),
    deployedUrl: `http://${id}.rishabh.dev.com:3001/index.html`,
  });

  await publisher.lPush(`user:${userId}:deployments`, id);
  console.log("saved deployment:", id, "for user:", userId);
  const check = await publisher.lRange(`user:${userId}:deployments`, 0, -1);
  console.log("user deployments list:", check);
  res.json({ id });
});

app.get("/deployments", async (req, res) => {
  const userId = req.query.userId as string;

  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  const ids = await subscriber.lRange(`user:${userId}:deployments`, 0, -1);

  if (ids.length === 0) {
    res.json({ deployments: [] });
    return;
  }

  const deployments = await Promise.all(
    ids.map((id) => subscriber.hGetAll(`deployment:${id}`)),
  );

  res.json({ deployments });
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await subscriber.hGet("status", id as string);
  res.json({
    status: response,
  });
});

app.listen(3000);
