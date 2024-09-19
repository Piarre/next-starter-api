import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { poweredBy } from "hono/powered-by";
import { CreateCommand, getTempName, replaceAlias } from "./lib/utils";
import { _App, RootLayout } from "./lib/data/shadcn";
import job from "./lib/cron";
import { Command } from "./lib/types/command";

import debugRoute from "./routes/debug";
import staticRoute from "./routes/static";

const app = new Hono();
export const QUEUE: { name: string; date: number }[] = [];
export const TEMP_DIR = process.env.TEMP_DIR || "temp";

app.use(logger());
app.use(
  "*",
  cors({
    origin: "*",
  }),
);
app.use(poweredBy());
app.use(prettyJSON());

app.get("/", (c) => c.json({ message: "Hello World" }));

app.post("/generate", async (c) => {
  let command = await c.req.json<Command>();

  let { name } = command;

  const tempName = getTempName();

  const tmpDir = (
    await Bun.$`mkdir ${tempName} && cd ${tempName} && pwd`.cwd(TEMP_DIR).nothrow().quiet()
  ).stdout
    .toString()
    .trim();

  const appPath = `${tmpDir}/${name}`;

  QUEUE.push({ name: tempName, date: Date.now() });

  await Bun.$`${{
    raw: CreateCommand(command),
  }}`
    .cwd(tmpDir)
    .nothrow()
    .quiet();

  await Bun.$`rm bun.lockb package-lock.json`.cwd(appPath).nothrow().quiet();
  await Bun.$`rm -rf .git`.cwd(appPath).nothrow().quiet();

  await Bun.$`tar --exclude "node_modules*" -zcvf ${name}.tar.gz ${name}/`
    .cwd(tmpDir)
    .nothrow()
    .quiet();
  await Bun.$`rm -rf ${name}`.cwd(tmpDir).nothrow().quiet();

  return c.json({
    link: `${
      process.env.APP_URL ?? "https://next-starter-api.piarre.app"
    }/static/${tempName}/${name}.tar.gz`,
  });
});

app.route("/debug", debugRoute);
app.route("/static/*", staticRoute);

job.start();

export default {
  port: 2025,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};
