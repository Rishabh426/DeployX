import express from "express";
import { S3 } from "aws-sdk"

const s3 = new S3({
    accessKeyId: "825a1c7ffa7a58bd9b2a88d2cdd0724e",
    secretAccessKey: "bf4afe3bfcf2abba7aa7e55d5e9802a6f38a3d7518410b5b98bd8707298bb6bc",
    endpoint: "https://3ed379d7938b7fe8529a55c36d305443.r2.cloudflarestorage.com",
})
const app = express();

app.get(/.*/, async (req, res) => {

    const host = req.hostname;

    const id = host.split(".")[0];
    const filepath = req.path;
    console.log(filepath);
    console.log(`dist/${id}${filepath}`);
    const contents = await s3.getObject({
        Bucket: "deployx",
        Key: `dist/${id}${filepath}`,
    }).promise();

    const type = filepath.endsWith("html") ? "text/html" : filepath.endsWith("css") ? 
    "text/css" : "application/javascript"
    res.set("Content-Type", type);
    res.send(contents.Body);
})

app.listen(3001);