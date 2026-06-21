# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"ГРАФЪ" — a Telegram Mini App for a barbershop, built as an educational demo.
React 18 + Vite, no database, no backend persistence. All app state lives in
memory (React `useState`). Bookings are never saved — confirmation just renders
a fake "booking code" screen. UI text, prompts, and comments are in Russian.

## Commands

```bash
npm install        # install deps
npm run dev        # dev server at http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # preview the built dist/
```

There are no tests, no linter, and no typechecker configured.

## Architecture

Almost the entire app is one file: `src/App.jsx` (~1250 lines). It is organized
top-to-bottom into clearly commented sections (`/* ===== DATA ===== */`, etc.):

- **DATA** — editable content lives at the top: `SALON` (contacts/hours),
  `SERVICES` (services + prices + duration), `BARBERS` (masters), `GALLERY`,
  `SUGGESTIONS`, `GREETING`. To change shop content, edit these constants.
  Barber photos are imported from `src/assets/` (14 image files).
- **HELPERS** — `generateSlots`/`nextDays` produce *deterministic fake*
  availability via `seededRandom` (no real schedule). `buildSystemPrompt`
  assembles the AI system prompt from `SERVICES`/`BARBERS`.
- **TELEGRAM WEBAPP SDK** — `getTg`, `tgHaptic`, `tgNotify`, `initTelegram`.
  The SDK is loaded via `<script>` in `index.html`. Outside Telegram,
  `window.Telegram.WebApp` is undefined and all SDK calls silently no-op, so
  the app degrades to a normal single-page site.
- **AI consultant** — `askConsultant` calls the proxy at `VITE_AI_ENDPOINT`.
  If that env var is empty (the default), it falls back to `mockConsultant`,
  a keyword-based offline stub — so the chat works immediately with no backend.
  The real path expects the proxy to return an OpenAI Chat Completions response
  (read from `choices[0].message.content`); the model must reply with strict
  JSON `{reply, suggestBooking, service}`. The frontend still sends `system` as a
  separate field (Anthropic-style) — the proxy folds it into `messages` as the
  first `system` message for OpenAI.
- **Components** — atoms (`WaxSeal`, `MainButton`, …), then the four screens:
  `HomeView`, `ServicesView`, `ChatView`, `BookingView`/`BookingSuccess`.
- **App** — the root component owns the two pieces of state: `tab`
  (home/services/chat/booking) and `booking` (a 5-step wizard object). Three
  `useEffect`s wire the Telegram `BackButton` and `MainButton` to the current
  screen/step. Navigation is conditional render on `tab` — there is no router.
- **STYLES** — all CSS is a single template-string constant `CSS` injected via
  an inline `<style>` tag in the App component. No CSS files, no Tailwind.

## AI proxy (`server/proxy.mjs`)

An Express server (`express`/`cors` are in `package.json`) that does two things:

1. `/api/chat` — holds `OPENAI_API_KEY` server-side and forwards `{system,
   messages}` to `${OPENAI_BASE_URL}/chat/completions` (folding `system` into
   the first `system` message and requesting JSON mode). The key is never
   shipped to the frontend. `OPENAI_BASE_URL` defaults to
   `https://api.openai.com/v1`; set it to `https://api.proxyapi.ru/openai/v1`
   for ProxyAPI (OpenAI-compatible, same `Bearer` auth — used for access from
   Russia). Loaded from `.env` via `dotenv`.
2. Serves the built `dist/` (only if it exists) with an SPA fallback, so in
   production the whole site runs as one Node process on one port — same origin,
   no CORS. In dev (no `dist/`) it acts as API-proxy only.

```bash
OPENAI_API_KEY=sk-... npm start    # = node server/proxy.mjs, listens on :8787
```

Env wiring for the AI endpoint is split by mode:
- **Production build** reads `.env.production` → `VITE_AI_ENDPOINT=/api/chat`
  (relative, same-origin). So `npm run build` bakes the real path automatically.
- **Local dev** (`npm run dev`) ignores `.env.production`, so with no `.env` the
  chat stays in mock mode. To test the real model locally, run the proxy and put
  `VITE_AI_ENDPOINT=http://localhost:8787/api/chat` in `.env`.

## Conventions & gotchas

- `vite.config.js` sets `base: "./"` so the build works both at a domain root
  and in a subdirectory — keep this for Mini App deploys (Mini Apps need HTTPS).
- The default model id used both client and proxy side is `gpt-4o-mini`.
- Keep the "works outside Telegram" property: guard all SDK access through the
  `getTg()` helper, never assume `window.Telegram` exists.
