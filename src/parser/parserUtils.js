export function expect(type, value) {
  const token = advance();

  if (token.type === "EOF") {
    throw new RavenError(`Expected ${label(type, value)}, but reached the end of the file`, token);
  }

  if (token.type !== type) {
    throw new RavenError(`Expected ${label(type, value)}, but got ${describe(token)}`, token);
  }

  if (value !== undefined && token.value !== value) {
    throw new RavenError(`Expected ${label(type, value)}, but got ${describe(token)}`, token);
  }

  return token;
}
