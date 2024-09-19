interface Options {
  importAlias: string;
  name: string;
  tailwind: boolean;
  eslint: boolean;
  app: boolean;
  srcDir: boolean;
  lang: "ts" | "js";
  skipInstall: boolean;
  cli: "npm" | "yarn" | "pnpm" | "bun";
  shadcnUi: boolean;
}

export { type Options };
