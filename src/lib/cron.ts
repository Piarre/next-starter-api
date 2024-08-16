import { CronJob } from "cron";
import { rmSync } from "node:fs";
import { QUEUE } from "..";

const job = new CronJob("*/5 * * * *", async () => {
  const dirToDelet = QUEUE.filter((dir) => Date.now() - dir.date > 5 * 60 * 1000);

  for (const dir of dirToDelet) {
    console.log(`Deleting ${dir.name}`);
    rmSync(`temp/${dir.name}`, { recursive: true });
    QUEUE.splice(QUEUE.indexOf(dir), 1);
  }
});

export default job;
