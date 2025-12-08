# Docs Template

> **Transform any technical content into a beautiful, interactive learning experience — in minutes, not days.**

## The Goal

Most technical documentation is **walls of text** that nobody wants to read. This template exists to solve that.

**The problem:** You have raw technical content (notes, guides, tutorials) but turning it into a polished, publishable site takes forever — setting up build tools, designing themes, creating diagrams, adding interactivity.

**The solution:** Drop your markdown into `raw/`, let Claude transform it following `CLAUDE.md` guidelines, and get a production-ready documentation site with:

- Visual diagrams that actually explain concepts
- Interactive code that readers can run and modify
- A teaching structure that builds understanding progressively
- Professional design that works on any device

**The vision:** Technical knowledge should be **accessible and learnable**, not locked in dense PDFs or scattered notes. This template makes publishing high-quality technical content as easy as writing markdown.

---

## Features

- **Red Theme** — Professional color scheme with dark mode
- **React Diagram Components** — Box, Arrow, ProcessFlow, TreeDiagram, CardGrid, and more
- **Interactive Code** — Run Python (Pyodide) and JavaScript in the browser
- **GitHub Pages Ready** — Auto-deploys via GitHub Actions
- **Pedagogical Structure** — Built-in teaching methodology guidelines

## Quick Start

### 1. Use This Template

Click "Use this template" on GitHub, or:

```bash
gh repo create my-docs --template YOUR_USERNAME/docs-template --public --clone
cd my-docs
```

### 2. Configure

Edit `docs/docusaurus.config.ts`:

```typescript
const PROJECT_NAME = 'My Guide';           // Your project name
const GITHUB_USERNAME = 'your-username';   // Your GitHub username
const REPO_NAME = 'my-docs';               // Your repo name
```

### 3. Add Content

1. Put raw markdown files in `raw/` folder
2. Transform them following `CLAUDE.md` guidelines
3. Output to `docs/docs/`

### 4. Deploy

```bash
cd docs && npm install && npm run build
git add . && git commit -m "Add content" && git push
```

Enable GitHub Pages: Settings → Pages → Source: GitHub Actions

## Structure

```
├── CLAUDE.md              # Content transformation guidelines
├── raw/                   # Put raw markdown here
├── docs/                  # Docusaurus project
│   ├── docs/              # Transformed content goes here
│   ├── src/
│   │   ├── components/diagrams/  # React diagram components
│   │   └── css/custom.css        # Custom theme
│   ├── static/img/        # Images and favicon
│   ├── docusaurus.config.ts
│   └── sidebars.ts
└── .github/workflows/     # Auto-deployment
```

## Using Diagrams

```jsx
import { Row, Box, Arrow, colors } from '@site/src/components/diagrams';

<Row gap="md">
  <Box color={colors.blue}>Input</Box>
  <Arrow direction="right" />
  <Box color={colors.green}>Output</Box>
</Row>
```

See `CLAUDE.md` for full component documentation.

## Interactive Code

**Python (works out of box):**
```jsx
import PythonRunner from '@site/src/components/PythonRunner';
<PythonRunner code={`print("Hello!")`} title="Example" />
```

**C++, Go, Rust, Java, etc:**
```jsx
import CodeRunner from '@site/src/components/CodeRunner';
<CodeRunner language="cpp" code={`#include <iostream>
int main() { std::cout << "Hello!"; }`} />
```

**JavaScript (live codeblock):**
~~~markdown
```jsx live
function Demo() { return <button>Click</button>; }
```
~~~

Supported: `python`, `cpp`, `c`, `go`, `rust`, `java`, `csharp`, `ruby`, `php`, `kotlin`, `swift`, `bash`, `sql`

## Content Guidelines

Follow the `CLAUDE.md` file for:

- Three-part explanations (plain English → technical → why it matters)
- Numbered TOC and header structure
- Insight and warning boxes
- No footnotes, no Mermaid

## License

MIT
