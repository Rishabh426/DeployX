import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
});

export async function downloadS3Folder(prefix: string) {
  console.log(process.env.accessKeyId);
  const allFiles = await s3
    .listObjectsV2({
      Bucket: "deployx",
      Prefix: prefix,
    })
    .promise();

  const allPromise =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirname = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }
        s3.getObject({
          Bucket: "deployx",
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];

  console.log("awaiting");
  await Promise.all(allPromise?.filter((x) => x !== undefined));
}

export function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach((file) => {
    uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
  });
}

export const uploadFile = async (filename: string, localfilePath: string) => {
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

export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesandFolders = fs.readdirSync(folderPath);
  allFilesandFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};
