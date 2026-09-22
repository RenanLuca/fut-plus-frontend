---
name: new-page
description: Scaffold a new page under view/pages following the project's Controller pattern. Use when the user asks to create a new page or screen.
---

Read `.claude/rules/architecture.md` and `.claude/rules/naming-conventions.md`
before doing anything.

1. If the page's purpose, route, and data needs aren't already clear from
   the conversation, invoke the same questioning style as `/grill-me`
   first: what data does it show, does it need a form, does it need any
   modal/dialog, is it a list or a detail page.
2. Scaffold under `view/pages/<PageName>/`:
   - `index.tsx` — the page entry, renders only, no logic
   - `use<PageName>Controller.ts` — data fetching (TanStack Query via a
     service in `app/services/`), state, handlers
   - `components/` — only if the page needs page-scoped presentational
     components (create this folder even if starting with just one file
     inside it)
3. If the page needs a route, register it in `app/router/` following
   whatever pattern already exists there — read the existing router file
   first, don't invent a new routing style.
4. If the page needs data from the backend and no service function exists
   yet for that resource, create it in `app/services/<resource>Service/`
   as its own file (one function per file, re-exported from that folder's
   `index.ts`), following `.claude/rules/forms-and-data.md`.
5. Never put a `useQuery`, `axios` call, or `useState` holding business data
   directly in `index.tsx`. If you catch yourself doing that, stop and move
   it into the controller.
6. Show the full file tree of what you're about to create before writing
   any file, and wait for confirmation.

Gotchas:
- Don't create an empty `components/` folder speculatively if the page has
  no page-scoped components yet — only create it when there's a real file
  to put inside it
- A page that's really just a thin wrapper rendering one existing
  component doesn't need its own controller — don't force the pattern
  where it adds no value, but flag that decision explicitly rather than
  silently skipping it
