# Docs Template

A ready-to-use Docusaurus template for transforming technical content into beautiful, learnable documentation sites.

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
