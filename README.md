# Website Components

Reusable TypeScript/JavaScript components for owen-lacey.com blog.

## Components

- **are-you-the-one-is-free-money**: Interactive Lit-based web components for probability analysis

## Development

Each component has its own package.json and build configuration.

### Building for Blog Integration

From the component directory:
```bash
cd are-you-the-one-is-free-money
bun install
bun run build:blog
```

This outputs compiled JavaScript and CSS to the blog's static directory.
