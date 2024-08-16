import pino from "pino";
import pretty from "pino-pretty";

export default pino(
  pretty({
    ignore: "pid",
  }),
);
