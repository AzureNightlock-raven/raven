import { parseStatement } from "./parserStatements.js";
import { createTokenStream } from "./tokenStream.js";

export function parse(tokens) {
  const stream = createTokenStream(tokens);

  const body = [];

  while (!stream.atEnd()) {
    body.push(parseStatement(stream));
  }

  return {
    type: "root",
    body,
  };
}
