import { Hono } from "hono";
import { QUEUE } from "..";
import { uptime } from "../lib/utils";

const debugRoute = new Hono();

// Get the current queue
debugRoute.get("/queue", (c) => c.json(QUEUE));

debugRoute.get("/uptime", (c) => c.json(uptime()));

debugRoute.all("/healthcheck", (c) => c.json({ status: "ok", uptime: uptime() }));

export default debugRoute;
