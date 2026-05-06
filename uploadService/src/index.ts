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
    // GitHub returns 404 for private repos when unauthenticated
    // so we treat 404 as a private repo, not an invalid one
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

  res.json({ id });
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await subscriber.hGet("status", id as string);
  res.json({
    status: response,
  });
});

app.listen(3000);
