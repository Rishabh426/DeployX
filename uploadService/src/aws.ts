import { S3 } from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
});

export const uploadFile = async (filename: string, localfilePath: string) => {
  console.log(process.env.accessKeyId);
  const fileContent = fs.readFileSync(localfilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "deployx",
      Key: filename,
    })
    .promise();
  console.log(response);
};
