# Raven

Raven is a small framework for building dashboards, pages, and other browser interfaces with a simple custom syntax.

It compiles Raven source files into plain HTML, CSS, and JavaScript. You can open, inspect, debug, and change the generated code.

> [!WARNING]
> Raven is still experimental. Expect bugs, missing features, and breaking changes.

## Installation

Do not use:

> [!CAUTION]
> ```
> npm install @azurenightlock/raven
> ```

Raven is a command-line tool, so install it globally:

```bash
npm install -g @azurenightlock/raven
```

A local installation will not make the `raven` command available everywhere on your system.

## Why use Raven?
* Syntax is easy to read and write and is similar to actual coding.
* Projects are very organised due to the fixed folder structure.
* Generated outputs are understandable and debugging is incredably easy.
* Error outputs are clean and clear
* Has 0 dependancies. So no package-lock.json, 1000+ node_modules, no supply-chain attacks

## Commands

Compile the current Raven project:

```bash
raven compile
```

Lint Raven source files:

```bash
raven lint
```

Format Raven source files:

```bash
raven format
```

Open the Raven documentation:

```bash
raven docs
```

## Output

Raven generates regular web files rather than a framework-specific runtime.

```text
output/
├── index.html
├── style.css
└── script.js
```

You can inspect the generated files, edit them manually, host them anywhere, or use them without Raven afterward.

## Project status

Raven is currently in early development.

The language, command-line interface, compiler behaviour, and generated output may change between versions. It is suitable for experimenting and building small projects, but it is not yet recommended for production use.

## License

Raven is released under the MIT License.
