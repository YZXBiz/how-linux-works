# Technical Documentation Template

_Transform raw technical content into beautiful, learnable Docusaurus sites_

---

## Quick Start

### 1. Setup (Already Done)

```bash
# Template includes:
# - Docusaurus 3.x with TypeScript
# - Custom red theme (custom.css)
# - React diagram components
# - GitHub Actions for deployment
```

### 2. Configure Your Project

Edit `docs/docusaurus.config.ts`:

```typescript
const config = {
  title: 'YOUR_PROJECT_NAME',           // Change this
  url: 'https://YOUR_USERNAME.github.io',
  baseUrl: '/YOUR_REPO_NAME/',
  organizationName: 'YOUR_USERNAME',
  projectName: 'YOUR_REPO_NAME',
};
```

### 3. Add Your Content

1. Put raw markdown files in `raw/` folder
2. Ask Claude to transform them following this guide
3. Output goes to `docs/docs/`

### 4. Deploy

```bash
git add . && git commit -m "Add content" && git push
# GitHub Actions auto-deploys to Pages
```

---

## Content Rules

- **No footnotes** — Keep all content inline, don't use `[^1]` style
- **No Mermaid** — Use React diagram components instead
- **Inline explanations** — Put context directly where needed

---

## Content Structure

### Frontmatter (Required)

```yaml
---
sidebar_position: 1
title: "Chapter Title"
description: "Brief description for SEO"
slug: /optional-custom-url
---
```

### Numbered TOC (Required)

```markdown
## Table of Contents

1. [Introduction](#1-introduction)
2. [Main Topic](#2-main-topic)
   - 2.1. [Subtopic](#21-subtopic)
3. [Summary](#3-summary)
```

### Header Numbering

| Level | Format | Example |
|-------|--------|---------|
| Main | `## 1.` | `## 1. Introduction` |
| Sub | `### 1.1.` | `### 1.1. Subtopic` |
| Sub-sub | `#### 1.1.1.` | `#### 1.1.1. Detail` |

### Navigation Footer

```markdown
---
**Previous:** [Link] | **Next:** [Link]
```

---

## Teaching Methodology

### Three-Part Explanation

Always introduce concepts with:

```markdown
**In plain English:** [Analogy anyone can understand]
**In technical terms:** [Precise definition]
**Why it matters:** [Real-world benefit]
```

### Insight Boxes

```markdown
> **Insight**
>
> [Key knowledge connecting concepts to broader patterns]
```

### Warning Boxes

```markdown
> **Warning**
>
> [Critical information about potential issues]
```

### Progressive Complexity

```
Simple concept -> Intermediate application -> Advanced implementation
```

---

## Emoji Usage

| Category | Emojis |
|----------|--------|
| **Sections** | Goals · Lists · Performance · Implementation · Pipelines |
| **Callouts** | Insight · Warning · Note · Learning · Security |
| **Content** | Code · Systems · Network · Performance · Metrics |

---

## React Diagram Components

### Import Statement

```jsx
import {
  Box, Arrow, Row, Column, Group,
  DiagramContainer, ProcessFlow, TreeDiagram,
  CardGrid, StackDiagram, ComparisonTable,
  colors
} from '@site/src/components/diagrams';
```

### Available Colors

```jsx
colors.blue    // #3b82f6
colors.purple  // #8b5cf6
colors.green   // #10b981
colors.orange  // #f59e0b
colors.red     // #ef4444
colors.slate   // #64748b
colors.cyan    // #06b6d4
colors.pink    // #ec4899
```

### Components

#### Box
```jsx
<Box color={colors.blue} variant="filled" size="md" icon="icon">
  Label
</Box>
// variant: 'filled' | 'outlined' | 'subtle'
// size: 'sm' | 'md' | 'lg'
```

#### Arrow
```jsx
<Arrow direction="right" label="connects to" />
// direction: 'right' | 'down' | 'left' | 'up'
```

#### Row & Column
```jsx
<Row gap="md" align="center" wrap={true}>{children}</Row>
<Column gap="md" align="center">{children}</Column>
// gap: 'sm' | 'md' | 'lg'
```

#### Group
```jsx
<Group title="Section" color={colors.blue} direction="column">
  {children}
</Group>
```

#### DiagramContainer
```jsx
<DiagramContainer title="Diagram Title">
  {children}
</DiagramContainer>
```

#### ProcessFlow
```jsx
<ProcessFlow
  direction="horizontal"
  steps={[
    { title: "Step 1", description: "Details", icon: "1", color: colors.blue },
    { title: "Step 2", description: "Details", icon: "2", color: colors.green }
  ]}
/>
```

#### TreeDiagram
```jsx
<TreeDiagram
  root={{
    label: "Root",
    color: colors.blue,
    children: [
      { label: "Child 1", color: colors.purple },
      { label: "Child 2", color: colors.green }
    ]
  }}
/>
```

#### CardGrid
```jsx
<CardGrid
  columns={3}
  cards={[
    { title: "Card", icon: "icon", color: colors.blue, items: ["Item 1"] }
  ]}
/>
```

#### StackDiagram
```jsx
<StackDiagram
  title="Layers"
  layers={[
    { label: "Top", color: colors.blue, items: ["A", "B"] },
    { label: "Bottom", color: colors.green, items: ["C"] }
  ]}
/>
```

#### ComparisonTable
```jsx
<ComparisonTable
  beforeTitle="Without"
  afterTitle="With"
  beforeColor={colors.red}
  afterColor={colors.green}
  items={[
    { label: "Speed", before: "Slow", after: "Fast" }
  ]}
/>
```

### Example Diagram

```jsx
<DiagramContainer title="System Flow">
  <Row gap="md">
    <Box color={colors.blue} icon="icon">Input</Box>
    <Arrow direction="right" />
    <Box color={colors.purple} icon="icon">Process</Box>
    <Arrow direction="right" />
    <Box color={colors.green} icon="icon">Output</Box>
  </Row>
</DiagramContainer>
```

---

## Design System

### Color Palette

| Token | Light | Dark |
|-------|-------|------|
| Primary | `#cc0000` | `#ff4444` |
| Primary Dark | `#b80000` | `#ff2b2b` |
| Primary Light | `#e00000` | `#ff6b6b` |

### Typography

| Element | Font |
|---------|------|
| Headings | Outfit |
| Body | Outfit |
| Code | JetBrains Mono |

---

## Checklists

### Structure
- [ ] Numbered TOC with working anchor links
- [ ] Consistent header numbering (1, 1.1, 1.2)
- [ ] Previous/Next navigation links
- [ ] Frontmatter with title, description, sidebar_position

### Teaching
- [ ] Start with analogies ("In plain English")
- [ ] Use progressive examples (simple to advanced)
- [ ] Include insight boxes for key concepts
- [ ] Add visual diagrams using React components

### Quality
- [ ] All code examples tested
- [ ] React diagrams for all visual flows (no Mermaid)
- [ ] No footnotes — keep content inline
- [ ] Dark mode works correctly

---

## Chapter Template

```markdown
---
sidebar_position: 2
title: "Chapter X: Topic"
description: "Description here"
---

import { Row, Box, Arrow, DiagramContainer, colors } from '@site/src/components/diagrams';

# Chapter X: Topic

> **"Quote"**
>
> — Attribution

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Main Section](#2-main-section)
3. [Summary](#3-summary)

---

## 1. Introduction

**In plain English:** [Simple explanation]
**In technical terms:** [Technical definition]
**Why it matters:** [Real-world benefit]

---

## 2. Main Section

<DiagramContainer title="Visual">
  <Row gap="md">
    <Box color={colors.blue}>A</Box>
    <Arrow direction="right" />
    <Box color={colors.green}>B</Box>
  </Row>
</DiagramContainer>

> **Insight**
>
> Key takeaway here.

---

## 3. Summary

### Key Takeaways

1. **First point** — Explanation
2. **Second point** — Explanation

---

**Previous:** [Prev Chapter](./prev) | **Next:** [Next Chapter](./next)
```

---

_Transform complex technical content into learnable knowledge_
