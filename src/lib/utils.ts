String.prototype.format = function () {
  return this.trim().replace(/\n/g, "").replace(/\s+/g, " ");
};

const getTempName = (): string => {
  const random = new Date().getTime() * +(Math.random() * 100).toFixed(0);

  return new Bun.CryptoHasher("md5").update(random.toString()).digest("hex");
};

const getAppName = (command: string) => {
  const splittedArgs = command.split(" ");
  const isNpx = splittedArgs[0] == "npx";

  return command.split(" ")[isNpx ? 2 : 3];
};

const getAlias = (command: string): string => {
  const splittedArgs = command.split(" ");
  const indexOfAlias = splittedArgs.indexOf("--import-alias");

  if (indexOfAlias === -1) return "@/*".split("/")[0];

  return splittedArgs[indexOfAlias + 1].replace(/\"/g, "").split("/")[0].format();
};

const replaceAlias = (content: string, alias: string) => content.replace(/ALIAS/g, alias);

export { getTempName, getAppName, getAlias, replaceAlias };
