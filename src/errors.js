import { GLYPH, purple, red, bold, dim } from "./style.js";

const TAB_WIDTH = 4;

export class RavenError extends Error {
  constructor(message, token, hint) {
    super(message);
    this.name = "RavenError";
    this.token = token;
    this.hint = hint;
  }
}

function expandTabs(text) {
  let out = "";
  for (const char of text) {
    if (char === "\t") out += " ".repeat(TAB_WIDTH - (out.length % TAB_WIDTH));
    else out += char;
  }
  return out;
}

function visualColumn(rawLine, column) {
  return expandTabs(rawLine.slice(0, column - 1)).length + 1;
}

export function renderError(error, source, file = "<anonymous>") {
  if (!error.token) return `  ${red(GLYPH.mark)} ${bold(error.message)}`;

  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const { line, column, length } = error.token;

  const raw = lines[line - 1] ?? "";
  const text = expandTabs(raw);
  const caretColumn = visualColumn(raw, column);
  const caretLength = Math.max(
    1,
    Math.min(
      expandTabs(raw.slice(column - 1, column - 1 + length)).length,
      Math.max(1, text.length - caretColumn + 1),
    ),
  );

  const width = String(Math.min(line + 1, lines.length)).length;
  const gutter = " ".repeat(width);
  const pad = (n) => String(n).padStart(width);
  const indent = " ".repeat(caretColumn - 1);

  const out = [
    `  ${red(GLYPH.mark)} ${bold(error.message)}`,
    `${gutter} ${GLYPH.open}[${dim(`${file}:${line}:${column}`)}]`,
  ];

  if (line - 2 >= 0) {
    out.push(`${pad(line - 1)} ${GLYPH.bar} ${expandTabs(lines[line - 2])}`);
  }

  out.push(`${pad(line)} ${GLYPH.bar} ${text}`);
  out.push(`${gutter} ${GLYPH.ann} ${indent}${red(GLYPH.under.repeat(caretLength))}`);

  if (line < lines.length) {
    out.push(`${pad(line + 1)} ${GLYPH.bar} ${expandTabs(lines[line])}`);
  }

  out.push(`${gutter} ${GLYPH.close}`);

  if (error.hint) out.push(`  ${purple("help:")} ${error.hint}`);

  return out.join("\n");
}

export function reportAndExit(error, source, file) {
  if (!(error instanceof RavenError)) throw error;
  console.error("\n" + renderError(error, source, file) + "\n");
  process.exit(1);
}
