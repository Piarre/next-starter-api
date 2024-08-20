import { Command } from "./types/command";

String.prototype.format = function () {
  return this.trim().replace(/\n/g, "").replace(/\s+/g, " ");
};

export const CreateCommand = ({
  app,
  eslint,
  importAlias,
  lang,
  name,
  srcDir,
  tailwind,
  shadcnUi,
}: Command): string => {
  return `bun create next-app 
  ${name} 
  --${lang} 
  ${tailwind ? "--tailwind" : "--no-tailwind"}
  ${eslint ? "--eslint" : "--no-eslint"}
  ${app ? "--app" : "--no-app"}
  ${srcDir ? "--src-dir" : "--no-src-dir"} 
  --import-alias "${importAlias}" 
  --use-bun
  ${
    shadcnUi &&
    `&& cd ${name}/
  && bunx --bun shadcn-ui@latest init --defaults`
  }`
    .replace(/\n/g, "")
    .replace(/\s+/g, " ");
};

const getTempName = (): string => {
  const random = new Date().getTime() * +(Math.random() * 100).toFixed(0);

  return new Bun.CryptoHasher("md5").update(random.toString()).digest("hex");
};

const replaceAlias = (content: string, alias: string) => content.replace(/ALIAS/g, alias);

export { getTempName, replaceAlias };
