import fs from "fs";
import path from "path";
import { RavenError } from "../errors.js";
import { generateNode } from "./generateNode.js";

export function generate(ast) {
  const outputDirectory = "output";

  fs.mkdirSync(outputDirectory, {
    recursive: true,
  });

  const html = generateHTML();
  const javascript = generateJavaScript(ast);

  fs.writeFileSync(path.join(outputDirectory, "index.html"), html);

  fs.writeFileSync(path.join(outputDirectory, "script.js"), javascript);
}

function generateHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Raven App</title>
  <script src="script.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body>
</body>
</html>
`;
}

function generateJavaScript(ast) {
  const lines = [];

  for (const node of ast.body) {
    generateNode(node, lines);
  }

  return lines.join("\n");
}

export function generateSetup() {
  const srcDirectory = path.join(process.cwd(), "src");
  const pageFile = path.join(srcDirectory, "page.rvn");

  if (fs.existsSync(pageFile)) {
    return {
      srcCreated: false,
      pageCreated: false,
    };
  }

  if (fs.existsSync(srcDirectory)) {
    fs.writeFileSync(pageFile, "", "utf8");

    return {
      srcCreated: false,
      pageCreated: true,
    };
  }

  fs.mkdirSync(srcDirectory, { recursive: true });
  fs.writeFileSync(pageFile, "", "utf8");

  return {
    srcCreated: true,
    pageCreated: true,
  };
}