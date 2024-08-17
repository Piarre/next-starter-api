String.prototype.format = function () {
  return this.trim().replace(/\n/g, "").replace(/\s+/g, " ");
};

const getTempName = (): string => {
  const random = new Date().getTime() * +(Math.random() * 100).toFixed(0);

  return new Bun.CryptoHasher("md5").update(random.toString()).digest("hex");
};

const getAppName = (command: string) => {
  const splittedArgs = command.split(" ");
  const isBun = splittedArgs[0] == "bun";
  const isNpx = splittedArgs[0] == "npx";

  return command.split(" ")[isBun || isNpx ? 3 : 4];
};
const getAlias = (command: string): string => {
  const splittedArgs = command.split(" ");
  const indexOfAlias = splittedArgs.indexOf("--import-alias");

  if (indexOfAlias === -1) return "@/*".split("/")[0];

  return splittedArgs[indexOfAlias + 1].replace(/\"/g, "").split("/")[0].format();
};

const avoidCLIInteractive = (command: string): string => {
  const splittedArgs = command.split(" ");

  const isNPX = splittedArgs[0] == "npx";
  const isYarn = splittedArgs[0] == "yarn";
  const isPNPM = splittedArgs[0] == "pnpm";

  if (isNPX) {
    return command.includes("--yes") ? command : command.replace(/npx/g, "npx --yes");
  } else if (isYarn) {
    return command.includes("--non-interactive")
      ? command
      : command.replace(/yarn/g, "yarn --non-interactive");
  } else if (isPNPM) {
    return command.includes("--yes") ? command : command.replace(/\bpnpm\b/, "pnpm --yes");
  }

  return command;
};

const replaceAlias = (content: string, alias: string) => content.replace(/ALIAS/g, alias);

export { getTempName, getAppName, getAlias, replaceAlias, avoidCLIInteractive };
