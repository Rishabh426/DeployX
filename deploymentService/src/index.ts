import { createClient } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();

const publisher = createClient();
publisher.connect();

let uniqueId: any = "0";

async function main() {
  while (1) {
    try {
      const response = await subscriber.brPop("build-queue", 0);
      console.log(response);

      const id = response?.element;
      uniqueId = id;

      await downloadS3Folder(`output/${response?.element}`);
      console.log("Downloaded");

      if (id) {
        await buildProject(id);
        copyFinalDist(id);
        publisher.hSet("status", id, "deployed");
        await publisher.hSet(`deployment:${id}`, {
          status: "deployed",
          deployedUrl: `http://${id}.rishabh.dev.com:3001/index.html`,
        });
      }
    } catch (e) {
      console.log(`Deployment failed:${uniqueId}`);
      await publisher.hSet("status", uniqueId, "failed");
      await publisher.hSet(`deployment:${uniqueId}`, {
        status: "failed",
        deployedUrl: "",
        failedAt: Date.now().toString(),
      });
    }
  }
}

main();
