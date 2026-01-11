# Are You The One - Interactive Components

This directory contains interactive Lit-based web components for the "Are You The One is Free Money" blog post analysis.

## Project Structure

```
src/
├── components/          # Lit web components (main interactive elements)
├── primitives/         # Reusable UI primitives (graphs, nodes, etc.)
├── helpers/           # Utility functions
├── models/           # Data models and interfaces
└── README.md        # This file
```

## Architecture

### Components (`/components/`)
Main interactive components that can be embedded in HTML. Each component:
- Extends `LitElement`
- Uses `@customElement` decorator with kebab-case naming
- Prefixed with `o-` (e.g., `o-all-seasons-log-degradation`)
- Self-contained with their own styling and data

### Primitives (`/primitives/`)
Reusable UI building blocks:
- `lineGraph.ts` - Multi-line graph component with tooltips and legends
- `drawable.ts` - Base class for canvas-based components
- `node.ts` - Node representation for graph visualizations

### Helpers (`/helpers/`)
Utility functions for data manipulation and drawing operations.

### Models (`/models/`)
TypeScript interfaces and data structures.

## Adding a New Component

### 1. Create the Component File

```typescript
// components/YourNewComponent.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('o-your-new-component')
export class YourNewComponent extends LitElement {
  @property({ type: Array })
  data: any[] = [];

  static styles = css`
    :host {
      display: block;
    }
    /* Component-specific styles */
  `;

  render() {
    return html`
      <div>Your component content</div>
    `;
  }
}
```

### 2. Naming Conventions

- **File name**: `PascalCase.ts` (e.g., `YourNewComponent.ts`)
- **Class name**: `PascalCase` (e.g., `YourNewComponent`)
- **Custom element**: `o-kebab-case` (e.g., `o-your-new-component`)
- **Prefix**: Always use `o-` prefix for custom elements

### 3. Using Primitives

Import and use existing primitives:

```typescript
import { LineData } from "../primitives/lineGraph";

// In your component
render() {
  return html`
    <o-line-graph
      xLabel="Time"
      yLabel="Value"
      .lines=${this.lines}
      .dotColorRenderer=${(v:any) => 'primary'}
    ></o-line-graph>
  `;
}
```

### 4. Styling Guidelines

- Use CSS custom properties (variables) for colors:
  ```css
  color: var(--primary);
  background: var(--theme);
  ```
- Available color variables:
  - Theme colors: `--primary`, `--secondary`, `--tertiary`, `--theme`
  - Palette colors: `--red`, `--blue`, `--green`, `--yellow`, `--purple`, `--teal`
  - Avoid: `--orange`, `--pink`

### 5. Data Handling

- Use `@property()` decorator for reactive properties
- Type your data with interfaces from `/models/`
- Example:
  ```typescript
  @property({ type: Array })
  seasonData: SeasonEvent[] = [];
  ```

### 6. Integration in Blog

Add the component to your HTML:

```html
<script type="module" src="/js/are-you-the-one-is-free-money/dist/components/YourNewComponent.js"></script>
<o-your-new-component></o-your-new-component>
```

## Existing Components Reference

### AllSeasonsLogDegradation
Multi-season probability degradation visualization using line graphs.

### BipartiteGraph / BipartiteGraphShuffle
Interactive bipartite graph visualizations for matching scenarios.

### MatchingLake
Lake visualization for matching probabilities.

### MuDemo / TbDemo
Interactive demonstrations for mathematical concepts.

### OneLogDegradation / OnePercentageDegradation
Single-season probability visualizations.

## Development Tips

1. **Hot Reloading**: Use a build tool that supports hot module replacement
2. **TypeScript**: All components use TypeScript for type safety
3. **Lit Lifecycle**: Use `firstUpdated()` for initialization, `updated()` for property changes
4. **Canvas Components**: Extend drawable primitives for custom canvas-based visualizations
5. **Responsive Design**: Components should work on mobile and desktop
6. **Accessibility**: Include proper ARIA labels and keyboard navigation where applicable

## Build and Bundle

Components are typically bundled for production. Make sure your build process:
- Transpiles TypeScript to JavaScript
- Handles Lit decorators properly
- Outputs to a `dist/` directory
- Maintains the component file structure

## CSS Variables Reference

The components inherit CSS variables from the main blog theme:

```css
/* Theme variables */
--primary: text color
--secondary: muted text
--tertiary: borders/dividers
--theme: background color

/* Color palette */
--red: #ff6b6b
--blue: #6bbcff  
--green: #6bcf8e
--yellow: #ffe066
--purple: #b18cff
--teal: #4fd6cb
```

These automatically adapt to light/dark theme switching.