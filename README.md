# Todo App

A reactive, real-time todo list application built with Electric SQL + TanStack DB. Changes sync instantly across all connected clients.

## Features

- Add todos via a dialog with keyboard support (Enter to submit)
- Toggle todos complete/incomplete with optimistic updates
- Delete todos with confirmation dialog
- Filter by All / Active / Completed
- Real-time sync across all clients via Electric SQL

## Tech Stack

- **Electric SQL** — Postgres-to-client sync via shapes
- **TanStack DB** — Reactive collections and optimistic mutations
- **Drizzle ORM** — Schema definitions and migrations
- **TanStack Start** — React meta-framework with SSR + server functions
- **Radix UI Themes** — Component library

## Getting Started

```bash
pnpm install
pnpm dev:start
```

The app will be available at `http://localhost:5173`.

## Commands

```bash
pnpm dev:start          # Start dev server + Postgres + Electric
pnpm dev:stop           # Stop all background services
pnpm test               # Run tests
pnpm run build          # Production build
pnpm drizzle-kit generate && pnpm drizzle-kit migrate  # Run migrations
```

## License

MIT
