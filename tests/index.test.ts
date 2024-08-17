import { describe, expect, test } from "bun:test";
import app from "../src/";

const args = "--ts --tailwind --no-eslint --no-app --src-dir --no-import-alias";

describe("Test all 4 CLI (srcDir, ts, tw)", () => {
  test("Using NPM (NPX)", async () => {
    const req = new Request("http://0.0.0.0:2025/generate", {
      body: JSON.stringify({
        command: `npx create-next-app@latest my-app ${args} --use-npm`,
      }),
      method: "POST",
    });
    const res = await app.fetch(req);
    expect(await res.json()).toHaveProperty("link");
    expect(res.status).toBe(200);
  });

  test("Using Bun", async () => {
    const req = new Request("http://0.0.0.0:2025/generate", {
      body: JSON.stringify({
        command: `bun create next-app my-app ${args} --use-bun`,
      }),
      method: "POST",
    });
    const res = await app.fetch(req);
    expect(await res.json()).toHaveProperty("link");
    expect(res.status).toBe(200);
  });

  test("Using Yarn", async () => {
    const req = new Request("http://0.0.0.0:2025/generate", {
      body: JSON.stringify({
        command: `yarn create next-app my-app ${args} --use-yarn`,
      }),
      method: "POST",
    });
    const res = await app.fetch(req);
    expect(await res.json()).toHaveProperty("link");
    expect(res.status).toBe(200);
  });

  //   test("Using PNPM", async () => {
  //     const req = new Request("http://0.0.0.0:2025/generate", {
  //       body: JSON.stringify({
  //         command: `pnpm create next-app my-app ${args} --use-pnpm`,
  //       }),
  //       method: "POST",
  //     });
  //     const res = await app.fetch(req);
  //     expect(await res.json()).toHaveProperty("link");
  //     expect(res.status).toBe(200);
  //   });
});
