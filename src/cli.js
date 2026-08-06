#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSetup } from "./generator/generator.js";
import { GLYPH, purple, deepPurple, red, green, bold, dim } from "./style.js";

const useColor =
  process.stdout.isTTY &&
  !process.env.NO_COLOR &&
  process.env.TERM !== "dumb";

const paint = (code) => (text) =>
  useColor ? `\x1b[${code}m${text}\x1b[0m` : text;

const currentDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);

const command = process.argv[2];
const commands = new Set(["init","compile", "format", "lint"]);

if (!commands.has(command)) {
  console.error(
    `${red(bold("✕ unknown command"))} ${red(command ?? "<none>")}\n` +
      `  ${dim("expected:")} ${[...commands]
        .map(purple)
        .join(dim(" | "))}`,
  );

  process.exit(1);
} else {
  console.log(
    `${purple("raven")} ${dim("›")} ${bold(deepPurple(command))}`,
  );
  if (command === "compile") {
    const entryFile = path.join(currentDirectory, "entry.js");

    // runs node entry.js from cwd of user
    const result = spawnSync(process.execPath, [entryFile], {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    if (result.error) {
      console.error(
        `${red(bold("Error"))} ${dim("could not start compiler")}`,
      );
      process.exit(1);
    }

    if (result.status !== 0) {
      console.error(
        `${red(bold("Error"))} ${dim("compilation failed")}`,
      );
    }

    process.exit(result.status ?? 1);
  }
  else if (command === "init") {
    try {
      const result = generateSetup();
      if (result.srcCreated && result.pageCreated) {
        console.log(`${purple("✓")} ${bold("Created src directory")}`);
        console.log(`${purple("✓")} ${bold("Created src/page.rvn")}`);
      }
      else if (!result.srcCreated && result.pageCreated) {
        console.log(`${dim("•")} ${dim("src directory already exists")}`);
        console.log(`${purple("✓")} ${bold("Created src/page.rvn")}`);
      }
      else {
        console.log(`${dim("•")} ${dim("src directory already exists")}`);
        console.log(`${dim("•")} ${dim("src/page.rvn already exists")}`);
        console.log(`${purple("✓")} ${bold("Project is already set up")}`);
      }
    }
    catch (error) {
      console.error(
        `${red(bold("✕ setup failed"))} ${dim(error.message)}`,
      );

      process.exit(1);
    }
  }
}