import { RavenError } from "../errors.js";
import { describe, tokenToSource } from "./tokenStream.js";

export function parseStatement(stream) {
  const token = stream.peek();

  if (token.type === "EOF") {
    throw new RavenError("Unexpected end of input", token);
  }

  if (token.type === "KEYWORD" && token.value === "createElement") {
    return parseCreateElement(stream);
  }

  if (token.type === "IDENTIFIER") {
    const member = stream.peek(2);
    const nextSymbol = stream.peek(3);

    if (nextSymbol.type === "SYMBOL" && nextSymbol.value === "EQUALS") {
      return parsePropertyAssignment(stream);
    }

    if (member.type === "IDENTIFIER" && member.value.startsWith("on")) {
      return parseEventListener(stream);
    }

    throw new RavenError(
      `Expected a property assignment or event handler after "${token.value}"`,
      token,
      `Write "${token.value}.property = value" or "${token.value}.onEvent(() => { ... })".`,
    );
  }

  throw new RavenError(`Unexpected ${token.type} ${describe(token)}`, token);
}

export function parsePropertyAssignment(stream) {
  // btn.textContent = 5
  //  ↑        ↑       ↑
  // object property value

  const object = stream.expect("IDENTIFIER");

  stream.expect("SYMBOL", "DOT");

  const property = stream.expect("IDENTIFIER");

  stream.expect("SYMBOL", "EQUALS");

  const nextToken = stream.peek();

  let value;

  if (nextToken.type === "NUMBER") {
    value = stream.expect("NUMBER");
  } else if (nextToken.type === "STRING") {
    value = stream.expect("STRING");
  } else {
    throw new RavenError(
      `Expected a number or string, but got ${describe(nextToken)}`,
      nextToken,
      `Property values must be a literal, like "hello" or 42.`,
    );
  }

  return {
    type: "PropertyAssignment",
    object: object.value,
    property: property.value,
    value: value.value,
  };
}

export function parseEventListener(stream) {
  const object = stream.expect("IDENTIFIER");
  stream.expect("SYMBOL", "DOT");
  const event = stream.expect("IDENTIFIER");
  stream.expect("SYMBOL", "LEFT_PAREN");
  stream.expect("SYMBOL", "LEFT_PAREN");
  stream.expect("SYMBOL", "RIGHT_PAREN");
  stream.expect("SYMBOL", "ARROW");
  const open = stream.expect("SYMBOL", "LEFT_BRACE");

  let action = "";

  while (!stream.atEnd() && !stream.match("SYMBOL", "RIGHT_BRACE")) {
    action += tokenToSource(stream.peek());
    stream.advance();
  }

  if (stream.atEnd()) {
    throw new RavenError(
      `Unclosed handler body for "${event.value}"`,
      open,
      `This "{" is never closed.`,
    );
  }

  stream.expect("SYMBOL", "RIGHT_BRACE");
  stream.expect("SYMBOL", "RIGHT_PAREN");

  return {
    type: "EventListener",
    object: object.value,
    eventType: event.value,
    action: action,
  };
}

export function parseCreateElement(stream) {
  stream.expect("KEYWORD", "createElement");

  stream.expect("SYMBOL", "LEFT_PAREN");

  const tagName = stream.expect("STRING");

  stream.expect("SYMBOL", "RIGHT_PAREN");

  stream.expect("KEYWORD", "as");

  const alias = stream.expect("IDENTIFIER");

  const open = stream.expect("SYMBOL", "LEFT_BRACE");

  const body = [];

  while (!stream.atEnd() && !stream.match("SYMBOL", "RIGHT_BRACE")) {
    body.push(parseStatement(stream));
  }

  if (stream.atEnd()) {
    throw new RavenError(`Unclosed block for "${alias.value}"`, open, `This "{" is never closed.`);
  }

  stream.expect("SYMBOL", "RIGHT_BRACE");

  return {
    type: "CreateElementStatement",
    tagName: tagName.value,
    alias: alias.value,
    body,
  };
}
