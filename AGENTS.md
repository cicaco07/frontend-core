# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-08

## OVERVIEW

Mobile Legends data + theorycrafting site. SvelteKit (Svelte 5 runes) + TypeScript + Tailwind v4, deployed to Vercel. Backend API is external (consumed, not built here).

## STRUCTURE

```
src/
├── lib/
│   ├── calc/     # damage ENGINE — pure TS, framework-agnostic (see calc/AGENTS.md)
│   ├── stores/   # runes state wrapping the engine (*.svelte.ts)
│   ├── types/    # domain contracts (StatBlock, Hero, Item, Emblem)
│   └── api/      # typed fetch wrapper, base URL from PUBLIC_API_BASE_URL
└── routes/       # data pages (SSR) + /theorycrafter (core interactive feature)
```

## WHERE TO LOOK

| Task             | Location                           | Notes                                    |
| ---------------- | ---------------------------------- | ---------------------------------------- |
| Damage/DPS math  | `src/lib/calc/formulas.ts`         | Pure functions, no Svelte                |
| Calculator state | `src/lib/stores/loadout.svelte.ts` | `$derived` chain, singleton export       |
| Data shapes      | `src/lib/types/`                   | Edit here to match backend response      |
| Backend calls    | `src/lib/api/client.ts`            | `apiGet<T>(path, fetch)`                 |
| Page data load   | `routes/*/+page.ts`                | Returns empty fallback on API error      |
| Nav links        | `routes/+layout.svelte`            | Must use `resolve()` (see ANTI-PATTERNS) |

## CONVENTIONS

- **Runes mode forced** project-wide via `svelte.config.js` (except node_modules). Use `$state`/`$derived`/`$props`, never legacy `$:` or stores from `svelte/store`.
- **Engine/state split**: calculation logic lives in `calc/` as pure functions; `stores/` only wraps them in reactive `$derived`. Never put math in `.svelte.ts`.
- **Stat convention**: `StatBlock` fields ending in `Pct` are ratios (`0.4` = 40%); all others flat. New stat fields must be added to `emptyStatBlock()` too.
- **API resilience**: load functions catch errors and return empty arrays, never throw on list pages. Detail pages `throw error(404, ...)`.

## ANTI-PATTERNS (THIS PROJECT)

- **Raw internal `href`** → eslint `svelte/no-navigation-without-resolve` fails build. Wrap with `resolve()` from `$app/paths`, called inline in the `href` (member access like `item.href` alone is NOT detected). Dynamic routes: `resolve('/heroes/[slug]', { slug })`.
- **Editing generated dirs** — `.svelte-kit/`, `.vercel/` are build output. Never edit.
- **Stale `$types` / `resolve()` LSP errors** after adding routes are EXPECTED. They clear on `svelte-kit sync` (run by `npm run check`). Trust `npm run check`, not inline diagnostics.
- **Type suppression** — no `as any`, `@ts-ignore`.

## COMMANDS

```bash
npm run dev          # vite dev @ localhost:5173
npm run check        # svelte-kit sync + svelte-check (authoritative type check)
npm run lint         # prettier --check + eslint
npm run format       # prettier --write
npm run test:unit    # vitest (engine tests live in calc/*.test.ts)
npm run build        # production build → .vercel/output
```

## NOTES

- Env: copy `.env.example` → `.env`, set `PUBLIC_API_BASE_URL` to backend URL.
- After adding any route, run `npm run check` to regenerate typed route registry before trusting `resolve()` types.
- LSP `oxlint` server is configured but not installed — the project lint is eslint via `npm run lint`, not oxlint.

```

```
