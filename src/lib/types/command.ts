type Command = {
  importAlias: string;
  name: string;
  tailwind: boolean;
  eslint: boolean;
  app: boolean;
  srcDir: boolean;
  lang: "ts" | "js";
  shadcnUi: boolean;
};

export { type Command };
