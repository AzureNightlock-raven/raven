import { RavenError } from "../errors.js";

const SYMBOLS = {
  DOT: ".",
  LEFT_PAREN: "(",
  RIGHT_PAREN: ")",
  LEFT_BRACE: "{",
  RIGHT_BRACE: "}",
  EQUALS: "=",
  GREATER_THAN: ">",
};

export function tokenToSource(token) {
  if (token.type === "STRING") {
    return JSON.stringify(token.value);
  }

  if (token.type === "SYMBOL") {
    return SYMBOLS[token.value];
  }

  return String(token.value);
}

export function describe(token) {
  return token.type === "EOF" ? "the end of the file" : `"${tokenToSource(token)}"`;
}

function label(type, value) {
  if (value === undefined) return type;
  return `"${SYMBOLS[value] ?? value}"`;
}

export function createTokenStream(tokens) {
  let position = 0;

  const last = tokens[tokens.length - 1];
  const eof = last
    ? {
        type: "EOF",
        value: null,
        line: last.line,
        column: last.column + last.length,
        length: 1,
      }
    : { type: "EOF", value: null, line: 1, column: 1, length: 1 };

  return {
    peek(offset = 0) {
      return tokens[position + offset] ?? eof;
    },

    advance() {
      return tokens[position++] ?? eof;
    },

    atEnd() {
      return this.peek().type === "EOF";
    },

    expect(type, value) {
      const token = this.advance();

      if (token.type === "EOF") {
        throw new RavenError(
          `Expected ${label(type, value)}, but reached the end of the file`,
          token,
        );
      }

      if (token.type !== type || (value !== undefined && token.value !== value)) {
        throw new RavenError(`Expected ${label(type, value)}, but got ${describe(token)}`, token);
      }

      return token;
    },

    match(type, value) {
      const token = this.peek();

      return token.type === type && (value === undefined || token.value === value);
    },
  };
}
