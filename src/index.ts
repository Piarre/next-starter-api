import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { poweredBy } from "hono/powered-by";
import { CreateCommand, getTempName, replaceAlias } from "./lib/utils";
import { _App, RootLayout, TailwindConfig } from "./lib/data/shadcn";
import { serveStatic } from "hono/bun";
import job from "./lib/cron";
import { Command } from "./lib/types/command";

const app = new Hono();

app.use(logger());
app.use(
  "*",
  cors({
    origin: "*",
  }),
);
app.use(poweredBy());
app.use(prettyJSON());

export const QUEUE: { name: string; date: number }[] = [];
export const TEMP_DIR = process.env.TEMP_DIR || "temp";

app.post("/generate", async (c) => {
  let command = await c.req.json<Command>();

  let { name, app, srcDir, shadcnUi, importAlias: alias, lang, tailwind } = command;

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

  if (shadcnUi) {
    const ext = lang === "ts" ? "x" : "";

    if (srcDir && app) {
      await Bun.write(
        `${appPath}/src/app/layout.${lang}${ext}`,
        replaceAlias(RootLayout[lang], alias),
      );
    } else if (srcDir && !app) {
      await Bun.write(`${appPath}/src/pages/_app.${lang}${ext}`, replaceAlias(_App[lang], alias));
    } else if (!srcDir && app) {
      await Bun.write(`${appPath}/app/layout.${lang}${ext}`, replaceAlias(RootLayout[lang], alias));
    } else if (!srcDir && !app) {
      await Bun.write(`${appPath}/pages/_app.${lang}${ext}`, replaceAlias(_App[lang], alias));
    }

    await Bun.write(`${appPath}/tailwind.config.${lang}`, TailwindConfig[lang]);
  }

  if (tailwind) await Bun.write(`${appPath}/tailwind.config.${lang}`, TailwindConfig[lang]);

  await Bun.$`rm pnpm-lock.yaml yarn.lock bun.lockb package-lock.json`
    .cwd(appPath)
    .nothrow()
    .quiet();

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

app.get("/", (c) => c.json({ message: "Hello, World!" }));

// Get a random MD5 hash
app.get("/md5", (c) => c.text(getTempName()));

// Get the current queue
app.get("/debug/queue", (c) => c.json(QUEUE));

// Serve static files for download
app.get(
  "/static/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/static/, "/temp"),
  }),
);

job.start();

export default {
  port: 2025,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};
