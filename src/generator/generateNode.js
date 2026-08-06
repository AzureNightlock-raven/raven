const properties = new Set([
  // All elements
  "textContent",
  "innerText",
  "innerHTML",
  "id",
  "title",
  "hidden",
  "lang",
  "dir",
  "tabIndex",
  "style",
  "dataset",

  // Forms
  "value",
  "name",
  "type",
  "placeholder",
  "checked",
  "disabled",
  "required",
  "readOnly",
  "multiple",
  "min",
  "max",
  "step",
  "minLength",
  "maxLength",
  "pattern",
  "autocomplete",

  // Links and media
  "href",
  "target",
  "download",
  "rel",
  "src",
  "alt",
  "width",
  "height",

  // Tables and lists
  "colSpan",
  "rowSpan",
  "start",
  "reversed",
]);


export function generateNode(node, lines, parent) {
  if (node.type === "CreateElementStatement") {
    lines.push(`const ${node.alias} = document.createElement(${JSON.stringify(node.tagName)});`);

    lines.push("");

    for (const statement of node.body) {
      generateNode(statement, lines, node.alias);
    }

    lines.push("");
    lines.push(`${parent ?? "document.body"}.appendChild(${node.alias});`);
  }

  if (node.type === "PropertyAssignment") {
    if (properties.has(node.property)) {
      lines.push(`${node.object}.${node.property} = ${JSON.stringify(node.value)};`);
    } else if (node.property === "class") {
      lines.push(`${node.object}.className = ${JSON.stringify(node.value)};`);
    } else {
      throw new RavenError(`Invalid Property. ${node.property} doesn't exist for ${node.object}`);
    }
  } else if (node.type === "EventListener") {
    const eventName = node.eventType.slice(2).toLowerCase();

    lines.push(`${node.object}.addEventListener(${JSON.stringify(eventName)}, () => {`);

    lines.push(`  ${node.action};`);
    lines.push(`});`);
  } 
}
