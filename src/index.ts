import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { poweredBy } from "hono/powered-by";
import { avoidCLIInteractive, getAlias, getAppName, getTempName, replaceAlias } from "./lib/utils";
import { _App, RootLayout, TailwindConfig } from "./lib/data/shadcn";
import { serveStatic } from "hono/bun";
import job from "./lib/cron";

const app = new Hono();

app.use(logger());
app.use(
  "*",
  cors({
    origin: "*",
  }),
);
app.use(poweredBy());

export const QUEUE: { name: string; date: number }[] = [];
export const TEMP_DIR = process.env.TEMP_DIR || "temp";

app.post("/generate", async (c) => {
  let { command } = await c.req.json<{ command: string }>();
  command = command.includes("--skip-install") ? command : `${command} --skip-install`;
  command = avoidCLIInteractive(command);

  const app = {
    name: getAppName(command),
    app: command.includes("--app"),
    srcDir: command.includes("--src-dir"),
    shadcn: command.includes("shadcn"),
    tempName: getTempName(),
    alias: getAlias(command),
    lang: command.includes("--ts") ? "ts" : "js",
  } as const;

  const tmpDir = (
    await Bun.$`mkdir ${app.tempName} && cd ${app.tempName} && pwd`.cwd(TEMP_DIR).nothrow().quiet()
  ).stdout
    .toString()
    .trim();

  const appPath = `${tmpDir}/${app.name}`;

  QUEUE.push({ name: app.tempName, date: Date.now() });

  await Bun.$`${{ raw: command }}`.cwd(tmpDir);

  if (app.shadcn) {
    const { lang } = app;
    const ext = lang === "ts" ? "x" : "";

    if (app.srcDir && app.app) {
      await Bun.write(
        `${appPath}/src/app/layout.${lang}${ext}`,
        replaceAlias(RootLayout[lang], app.alias),
      );
    } else if (app.srcDir && !app.app) {
      await Bun.write(
        `${appPath}/src/pages/_app.${lang}${ext}`,
        replaceAlias(_App[lang], app.alias),
      );
    } else if (!app.srcDir && app.app) {
      await Bun.write(
        `${appPath}/app/layout.${lang}${ext}`,
        replaceAlias(RootLayout[lang], app.alias),
      );
    } else if (!app.srcDir && !app.app) {
      await Bun.write(`${appPath}/pages/_app.${lang}${ext}`, replaceAlias(_App[lang], app.alias));
    }

    await Bun.write(`${appPath}/tailwind.config.${lang}`, TailwindConfig[lang]);
  }

  await Bun.$`tar --exclude "node_modules*" -zcvf ${app.name}.tar.gz ${app.name}/`.cwd(tmpDir);
  await Bun.$`rm -rf ${app.name}`.cwd(tmpDir);

  return c.json({
    link: `https://next-starter-api.piarre.app/static/${app.tempName}/${app.name}.tar.gz`,
  });
});

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

app.get("/test", (c) => c.json({ message: "Hello, World!" }));

job.start();

export default {
  port: 2025,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};
