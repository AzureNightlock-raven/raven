#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const useColor =
  process.stdout.isTTY &&
  !process.env.NO_COLOR &&
  process.env.TERM !== "dumb";

const paint = (code) => (text) =>
  useColor ? `\x1b[${code}m${text}\x1b[0m` : text;

const purple = paint("38;5;141");
const deepPurple = paint("38;5;99");
const red = paint("38;5;203");
const bold = paint("1");
const dim = paint("2");

const currentDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);

const command = process.argv[2];
const commands = new Set(["compile", "format", "lint"]);

if (!commands.has(command)) {
  console.error(
    `${red(bold("✕ unknown command"))} ${red(command ?? "<none>")}\n` +
      `  ${dim("expected:")} ${[...commands]
        .map(purple)
        .join(dim(" | "))}`,
  );

  process.exit(1);
}

console.log(
  `${purple("raven")} ${dim("›")} ${bold(deepPurple(command))}`,
);

const entryFile = path.join(currentDirectory, "entry.js");

const result = spawnSync(process.execPath, [entryFile], {
  stdio: "inherit",
  cwd: process.cwd(),
});

if (result.status !== 0) {
  console.error(
    `${red(bold("✕ grounded"))} ${dim("compilation failed")}`,
  );
}

process.exit(result.status ?? 1);