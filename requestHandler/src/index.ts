import express from "express";
import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  endpoint: process.env.endpoint,
});
const app = express();

app.get(/.*/, async (req, res) => {
  const host = req.hostname;

  const id = host.split(".")[0];
  const filepath = req.path;
  console.log(filepath);
  console.log(`dist/${id}${filepath}`);
  const contents = await s3
    .getObject({
      Bucket: "deployx",
      Key: `dist/${id}${filepath}`,
    })
    .promise();

  const type = filepath.endsWith("html")
    ? "text/html"
    : filepath.endsWith("css")
      ? "text/css"
      : "application/javascript";
  res.set("Content-Type", type);
  res.send(contents.Body);
});

app.listen(3001);
