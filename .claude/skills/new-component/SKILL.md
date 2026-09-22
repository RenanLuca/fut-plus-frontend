---
name: new-component
description: Scaffold a new component following the project's flat-file-vs-folder convention. Use when the user asks to create a new component.
---

Read `.claude/rules/naming-conventions.md` before doing anything, specifically
the "Componente: arquivo solto vs pasta própria" section.

1. Determine where the component belongs:
   - Used only within one page (including a modal/dialog tied to that
     page) → `view/pages/<PageName>/components/`
   - Reused across pages → `view/components/`
   - Generic UI primitive (shadcn/Base UI wrapper) → `view/components/ui/`
   - Custom icon → `view/components/svg/`
   If it's not obvious from the request which of these applies, ask.

2. Determine flat file vs own folder using the decision rule in
   naming-conventions.md: if the component will have exactly one file
   (`ComponentName.tsx`) and nothing else, it's flat. If it needs a
   controller, a types file, or sub-components, it gets its own folder with
   `index.tsx`.

3. If the component has any non-trivial state or logic (anything beyond a
   single simple UI-only boolean toggle), it needs a co-located hook
   (`useComponentName.ts` or `useComponentNameController.ts` per the
   naming rule) — don't put that logic in the `.tsx`.

4. Name the props type `<ComponentName>Props`.

5. Show what you're about to create (path + whether flat or folder) before
   writing, and wait for confirmation if there was any ambiguity in step 1
   or 2.

Gotchas:
- Don't default to folder "just in case it grows later" — start flat, and
  move it into a folder later if it actually grows. Speculative folders
  create noise.
- A component that wraps a shadcn/Base UI primitive with fixed props is
  still flat unless it has real logic of its own
