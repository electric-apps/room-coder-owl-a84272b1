# Todo App — Implementation Plan

## App Description
A reactive, real-time todo list application built with Electric SQL + TanStack DB. Users can add, complete, and delete todos, with changes syncing in real time across all clients via Electric SQL.

## Data Model

### todos
- id: UUID, primary key, defaultRandom()
- title: text, notNull
- completed: boolean, notNull, default false
- created_at: timestamptz, notNull, defaultNow()
- updated_at: timestamptz, notNull, defaultNow()

## Implementation Tasks
- [ ] Phase 2: Discover playbook skills and read relevant ones
- [ ] Phase 3: Data model — schema, zod-schemas, migrations, tests
- [ ] Phase 4: Collections & API routes
- [ ] Phase 5: UI components
- [ ] Phase 6: Build, lint & test
- [ ] Phase 7: README.md
- [ ] Phase 8: Deploy & send `@room REVIEW_REQUEST:` (MANDATORY — pipeline stalls without it)

## Design Conventions
- UUID primary keys with defaultRandom()
- timestamp({ withTimezone: true }) for all dates
- snake_case for SQL table/column names
- Foreign keys with onDelete: "cascade" where appropriate
