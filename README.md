# Talks Monorepo

A pnpm workspace monorepo for managing talks and presentations.

## Structure

```
talks/
├── packages/          # Shared packages and libraries
├── playground/        # Development playground for testing
├── docs/             # Documentation site
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Run all packages in dev mode
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint
```

### Workspace Commands

```bash
# Install a dependency to the root
pnpm add -w <package>

# Install a dependency to a specific workspace
pnpm add <package> --filter <workspace-name>

# Run a command in a specific workspace
pnpm --filter <workspace-name> <command>

# Run a command in all workspaces
pnpm -r <command>
```

## Workspace Packages

- `packages/*` - Shared packages and libraries
- `playground` - Development playground
- `docs` - Documentation site
