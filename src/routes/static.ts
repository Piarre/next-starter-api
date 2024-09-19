import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const staticRoute = new Hono();

// Serve static files for download
staticRoute.get(
  "/",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/static/, "/temp"),
  }),
);

export default staticRoute;
