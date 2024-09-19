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
  --no-turbo
  --skip-install
  ${
    shadcnUi &&
    `&& cd ${name}/
  && bunx --bun shadcn@latest init --defaults`
  }`
    .replace(/\n/g, "")
    .replace(/\s+/g, " ");
};

const getTempName = (): string => {
  const random = new Date().getTime() * +(Math.random() * 100).toFixed(0);

  return new Bun.CryptoHasher("md5").update(random.toString()).digest("hex");
};

const replaceAlias = (content: string, alias: string) =>
  content.replace(/ALIAS/g, alias.split("/")[0]);

const uptime = () => {
  return {
    days: Math.floor(process.uptime() / 86400),
    hours: Math.floor((process.uptime() % 86400) / 3600),
    minutes: Math.floor((process.uptime() % 3600) / 60),
    seconds: Math.floor(process.uptime() % 60),
  };
};

export { getTempName, replaceAlias, uptime };
