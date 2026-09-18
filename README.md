# App Music

Personal music streaming app. Stream your MP3 library from an external HD connected to your PC, accessible from anywhere via mobile.

<table>
  <tr>
    <td align="center"><img src="docs/screens/library.jpg" width="250" /><br /><sub>Biblioteca</sub></td>
    <td align="center"><img src="docs/screens/player.jpg" width="250" /><br /><sub>Player</sub></td>
  </tr>
</table>

## Architecture

Monorepo with hexagonal architecture — backend Fastify + React Native (Expo) mobile app, communicating via HTTP.

![Layout](docs/images/layout.png)

```
app-music/
├── apps/
│   ├── server/          # Fastify backend
│   │   ├── src/
│   │   │   ├── domain/        # Use cases, entities, contracts
│   │   │   ├── infra/         # Repositories, services, routes, controllers
│   │   │   ├── schemas/       # Centralized Zod schemas
│   │   │   └── server.ts
│   │   └── ...
│   └── mobile/          # React Native app (Expo)
│       └── src/
│           ├── hooks/         # usePlayer, usePlayerQueue, queries, mutations
│           ├── screens/       # Player, Search, Biblioteca, Playlists
│           ├── audio/         # AudioPlayerService (expo-audio)
│           └── ...
├── shared/              # Zod schemas (frontend ↔ backend)
├── docs/
│   └── screens/         # App screenshots
├── biome.json           # Linting & formatting
├── lefthook.yml         # Git hooks
└── pnpm-workspace.yaml
```

### Design Principles

- **Hexagonal architecture** — domain depends on nothing, infrastructure implements interfaces
- **Use cases** — `ScanMusicLibrary`, `GetMusicById`, `StreamMusic`, etc.
- **Controllers** — thin layer mapping use case results to HTTP responses
- **Centralized schemas** — `apps/server/src/schemas/` as single source of truth
- **Centralized error handling** — `DomainError` mapped to HTTP status codes automatically

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Package manager** | pnpm workspaces |
| **Linting** | Biome |
| **Backend** | Fastify, Drizzle ORM, better-sqlite3, music-metadata |
| **Mobile** | Expo SDK 57, React Native, NativeWind, expo-audio |
| **Validation** | Zod (shared schemas) |
| **State** | TanStack Query v5 |
| **Testing** | Vitest, React Testing Library |
| **Hooks** | Lefthook (pre-commit, pre-push) |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install

```bash
pnpm install
```

### Backend

```bash
cd apps/server
cp .env.example .env    # configure MUSIC_DIR, PORT
pnpm dev
```

Server runs on `http://localhost:3000` by default.

### Mobile

```bash
cd apps/mobile
cp .env.example .env    # set EXPO_PUBLIC_API_BASE
pnpm start
```

Scan the QR code with Expo Go (Android) or Camera (iOS).

> **Note:** Must use `--lan` mode. Tunnel mode is not supported.

### Environment Variables

**Server** (`apps/server/.env`):
| Variable | Default | Description |
|----------|---------|-------------|
| `MUSIC_DIR` | — | Path to MP3 directory |
| `PORT` | `3000` | Server port |

**Mobile** (`apps/mobile/.env`):
| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_BASE` | Server URL (e.g. `http://192.168.0.104:3000`) |

## Features

<table>
  <tr>
    <td align="center"><img src="docs/screens/search.jpg" width="250" /><br /><sub>Busca</sub></td>
    <td align="center"><img src="docs/screens/playlist.jpg" width="250" /><br /><sub>Playlist</sub></td>
  </tr>
</table>

- **Music library** — browse all tracks grouped by album with pull-to-refresh
- **Streaming** — stream MP3s with 30s forward buffer, prefetch, and Range request support
- **Search** — real-time search with recent search history
- **Playlists** — create, add/remove songs, playlist-aware playback
- **Equalizer** — native Android equalizer with 5 presets
- **Cover art** — album art fetched from Last.fm with local cache
- **Auto-advance** — playlist-aware next/prev with infinite scroll
- **Background audio** — playback continues when app is in background
- **Lock screen controls** — media metadata on Android lock screen
- **Buffering indicator** — visual feedback during stream loading

## Testing

```bash
# Backend (95 tests)
cd apps/server && pnpm test

# Mobile (202 tests)
cd apps/mobile && pnpm test

# All
pnpm -r test
```

## Code Quality

```bash
pnpm check        # Biome lint + format
pnpm typecheck    # TypeScript
```

Git hooks (via Lefthook):
- **pre-commit** — `biome check`
- **pre-push** — typecheck + tests
