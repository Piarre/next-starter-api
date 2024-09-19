import { CronJob } from "cron";
import { rmSync } from "node:fs";
import { QUEUE, TEMP_DIR } from "..";

export default new CronJob("*/5 * * * *", async () => {
  const dirToDelet = QUEUE.filter((dir) => Date.now() - dir.date > 5 * 60 * 1000);

  for (const dir of dirToDelet) {
    console.log(`Deleting ${dir.name}`);
    rmSync(`${TEMP_DIR}/${dir.name}`, { recursive: true });
    QUEUE.splice(QUEUE.indexOf(dir), 1);
  }
});
