import { createClient } from "redis"
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();

async function main() { 
    while(1) {
        const response = await subscriber.brPop("build-queue", 0);
        console.log(response);
        const id = response?.element;
        await downloadS3Folder(`output/${response?.element}`);
        console.log("Downloaded");
        await buildProject(id || "");
        copyFinalDist(id || "");
    }
}

main();


