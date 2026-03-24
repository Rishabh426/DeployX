import { S3 } from "aws-sdk"
import fs from "fs"
import path from "path"

const s3 = new S3({
    accessKeyId: "825a1c7ffa7a58bd9b2a88d2cdd0724e",
    secretAccessKey: "bf4afe3bfcf2abba7aa7e55d5e9802a6f38a3d7518410b5b98bd8707298bb6bc",
    endpoint: "https://3ed379d7938b7fe8529a55c36d305443.r2.cloudflarestorage.com",
});

export async function downloadS3Folder(prefix: string) {

    const allFiles = await s3.listObjectsV2({
        Bucket: "deployx",
        Prefix: prefix,
    }).promise();

    const allPromise = allFiles.Contents?.map(async ({ Key }) => {
        return new Promise(async (resolve) => {
            if(!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirname = path.dirname(finalOutputPath);
            if(!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname, { recursive: true });
            }   
            s3.getObject({
                Bucket: "deployx",
                Key,
            }).createReadStream().pipe(outputFile).on("finish", () => {
                resolve("");
            })
        })
    }) || [];

    console.log("awaiting");
    await Promise.all(allPromise?.filter(x => x !== undefined));
}

export function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach((file) => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}

export const uploadFile = async (filename: string, localfilePath: string) => {
    
    const fileContent = fs.readFileSync(localfilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "deployx",
        Key: filename,
    }).promise();
    console.log(response);
}

export const getAllFiles = (folderPath: string) => {

    let response : string[] = [];

    const allFilesandFolders = fs.readdirSync(folderPath);
    allFilesandFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if(fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath));
        }
        else {
            response.push(fullFilePath);
        }
    })
    return response;
}