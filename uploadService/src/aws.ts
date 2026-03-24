import { S3 } from "aws-sdk"
import fs from "fs"

const s3 = new S3({
    accessKeyId: "825a1c7ffa7a58bd9b2a88d2cdd0724e",
    secretAccessKey: "bf4afe3bfcf2abba7aa7e55d5e9802a6f38a3d7518410b5b98bd8707298bb6bc",
    endpoint: "https://3ed379d7938b7fe8529a55c36d305443.r2.cloudflarestorage.com",
});

export const uploadFile = async (filename: string, localfilePath: string) => {
    
    const fileContent = fs.readFileSync(localfilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "deployx",
        Key: filename,
    }).promise();
    console.log(response);
}