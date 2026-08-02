export const useColor =
  process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== "dumb";

export const useUnicode =
  process.env.TERM !== "dumb" &&
  (process.platform !== "win32" ||
    Boolean(process.env.WT_SESSION) ||
    Boolean(process.env.TERM_PROGRAM));

const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);

export const purple = paint("38;5;141");
export const deepPurple = paint("38;5;99");
export const red = paint("38;5;203");
export const green = paint("38;5;77");
export const bold = paint("1");
export const dim = paint("2");

export const GLYPH = useUnicode
  ? {
      feather: "\u{1FAB6}",
      chevron: "\u203A",
      ok: "\u2713",
      fail: "\u2715",
      mark: "x",
      bar: "\u2502",
      ann: "\u00B7",
      open: "\u256D\u2500",
      close: "\u2570\u2500\u2500\u2500\u2500",
      under: "\u2500",
    }
  : {
      feather: "",
      chevron: ">",
      ok: "+",
      fail: "x",
      mark: "x",
      bar: "|",
      ann: ":",
      open: "+-",
      close: "+----",
      under: "^",
    };
