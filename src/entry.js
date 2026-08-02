import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { tokenize } from "./tokeniser.js";
import { parse } from "../parser/parserMain.js";
import { generate } from "./generator.js";
import { reportAndExit } from "./errors.js";
import { GLYPH, purple, deepPurple, red, green, bold, dim } from "./style.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();
const file = process.argv[3] ?? "page.rvn";
const outputDir = path.join(cwd, "output");

const version = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8")).version;
  } catch {
    return "0.0.0";
  }
})();

const TOTAL = 4;
const LABEL_WIDTH = 24;
let stage = 0;

function step(label, run) {
  stage++;
  process.stdout.write(`${dim(`[${stage}/${TOTAL}]`)} ${label.padEnd(LABEL_WIDTH)}`);

  try {
    const result = run();
    process.stdout.write(`${green("done")}\n`);
    return result;
  } catch (error) {
    process.stdout.write(`${red("fail")}\n`);
    throw error;
  }
}

function formatSize(bytes) {
  return `${(bytes / 1000).toFixed(2)} kB`;
}

const started = performance.now();
const source = fs.readFileSync(path.join(cwd, file), "utf-8");

console.log(`${purple("raven")} ${dim(`v${version}`)}`);

let written = [];

try {
  const tokens = step("Tokenizing source", () => tokenize(source));
  const ast = step("Building AST", () => parse(tokens));
  const output = step("Generating JavaScript", () => generate(ast));

  written = step("Writing output", () => {
    if (!output) {
      return ["index.html", "script.js"]
        .map((name) => path.join(outputDir, name))
        .filter((target) => fs.existsSync(target));
    }

    fs.mkdirSync(outputDir, { recursive: true });

    return Object.entries(output).map(([name, contents]) => {
      const target = path.join(outputDir, name);
      fs.writeFileSync(target, contents);
      return target;
    });
  });
} catch (error) {
  reportAndExit(error, source, file);
}

const elapsed = Math.round(performance.now() - started);

console.log(`${green(GLYPH.ok)} ${bold("Compilation successful")}`);

const nameWidth = Math.max(...written.map((target) => path.relative(root, target).length), 0);

for (const target of written) {
  const relative = path.relative(root, target).replace(/\\/g, "/");
  const size = formatSize(fs.statSync(target).size);
  console.log(`  ${deepPurple(relative.padEnd(nameWidth + 2))}${dim(size)}`);
}

console.log(`${green(GLYPH.ok)} compiled in ${bold(`${elapsed}ms`)}`);