import express from "express";
import cookieParser from "cookie-parser";
import { S3 } from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
});

const app = express();
app.use(cookieParser());

app.get(/.*/, async (req, res) => {
  const host = req.hostname;
  const parts = host.split(".");

  let id: string;
  let filepath: string;

  if (host === "localhost" || parts.length < 3) {
    const pathParts = req.path.split("/").filter(Boolean);
    const firstSegment = pathParts[0] || "";

    // asset request — first segment is "assets" or contains a dot (file extension)
    const isAssetRequest =
      !firstSegment ||
      firstSegment === "assets" ||
      firstSegment.includes(".") ||
      firstSegment === ".well-known";

    if (isAssetRequest) {
      // get deployment ID from cookie set when index.html was served
      id = req.cookies?.deploymentId || "";
      filepath = req.path;
    } else {
      // first segment is the deployment ID
      id = firstSegment;
      filepath =
        pathParts.length >= 2
          ? "/" + pathParts.slice(1).join("/")
          : "/index.html";

      // save ID in cookie so asset requests know which deployment to serve
      res.cookie("deploymentId", id, {
        httpOnly: false,
        maxAge: 1000 * 60 * 60, // 1 hour
      });
    }
  } else {
    // subdomain-based: abc123.domain.com
    id = parts[0];
    filepath = req.path;
  }

  console.log("id:", id, "filepath:", filepath);

  if (!id) {
    res.status(400).send("No deployment ID found");
    return;
  }

  const finalPath = filepath === "/" ? "/index.html" : filepath;

  try {
    const contents = await s3
      .getObject({
        Bucket: "deployx",
        Key: `dist/${id}${finalPath}`,
      })
      .promise();

    const type = finalPath.endsWith(".html")
      ? "text/html"
      : finalPath.endsWith(".css")
        ? "text/css"
        : finalPath.endsWith(".js")
          ? "application/javascript"
          : finalPath.endsWith(".png")
            ? "image/png"
            : finalPath.endsWith(".jpg") || finalPath.endsWith(".jpeg")
              ? "image/jpeg"
              : finalPath.endsWith(".svg")
                ? "image/svg+xml"
                : finalPath.endsWith(".ico")
                  ? "image/x-icon"
                  : finalPath.endsWith(".json")
                    ? "application/json"
                    : "application/octet-stream";

    res.set("Content-Type", type);
    res.send(contents.Body);
  } catch (err: any) {
    if (err.code === "NoSuchKey") {
      // SPA fallback — serve index.html for client-side routes
      try {
        const index = await s3
          .getObject({
            Bucket: "deployx",
            Key: `dist/${id}/index.html`,
          })
          .promise();
        res.set("Content-Type", "text/html");
        res.send(index.Body);
      } catch {
        res.status(404).send("Deployment not found");
      }
    } else {
      console.error("S3 error:", err);
      res.status(500).send("Error fetching file");
    }
  }
});

app.listen(3001, () => console.log("Request handler running on port 3001"));
