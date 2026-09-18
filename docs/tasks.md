# Tasks — Music Streaming App

## Monorepo Setup

- v Initialize root pnpm workspace with `pnpm-workspace.yaml`
- v Set up `apps/server/` package (Fastify backend)
- v Set up `apps/mobile/` package (React Native + Expo)
- v Configure Biome for linting and formatting across monorepo
- v Configure Zod for schema validation (shared between frontend/backend)

## Backend

- v Initialize Fastify server with `fastify-zod` provider
- v Set up SQLite database with `better-sqlite3`
- v Create database schema (musics, playlists, playlist_musics, cover_cache)
- v Define domain entities (`Music`, `Playlist`)
- v Create repository contracts (`IMusicRepository`, `IPlaylistRepository`)
- v Implement `MusicRepository` with SQLite
- v Implement `PlaylistRepository` with SQLite
- v Create in-memory repositories for testing
- v Create use cases: `ListMusics`
- v Create use cases: `StreamMusic` (HTTP Range support)
- v Create use cases: `SearchMusics`
- v Create use cases: `CreatePlaylist`
- v Create use cases: `AddMusicToPlaylist`
- v Create use cases: `ListPlaylists`
- v Create use cases: `RemoveMusicFromPlaylist`
- v Implement `ScannerService` (music-metadata for ID3 tags)
- v Implement `CoverService` (Last.fm API integration)
- v Create API routes: `/music`, `/music/:id`, `/stream/:id`, `/cover/:id`, `/search`
- v Create API routes: `/playlists`, `/playlists/:id/add`, `/playlists/:id/remove/:musicId`
- v Create API route: `/scan`
- v Create controllers (MusicController, PlaylistController)
- v Add `@fastify/cors` for cross-origin requests
- v Add error handling middleware

## Backend Testing

- v Write unit tests for `ListMusics` use case
- v Write unit tests for `StreamMusic` use case
- v Write unit tests for `SearchMusics` use case
- v Write unit tests for `CreatePlaylist` use case
- v Write unit tests for `AddMusicToPlaylist` use case
- v Write unit tests for `ListPlaylists` use case
- v Write unit tests for `RemoveMusicFromPlaylist` use case
- v Write repository tests with in-memory SQLite
- v Write integration tests for routes (supertest)
- v Write in-memory repository tests

## Frontend

- v Initialize Expo project with NativeWind
- v Configure Zod for frontend schema validation
- v Set up React Navigation (stack + tab navigators)
- v Create `AudioPlayer` service using `expo-av`
- v Create `MusicApi` service with axios
- v Create `usePlayer` hook
- v Create `usePlaylist` hook
- v Create `AppNavigator`
- v Create `HomeScreen` (music list, navigation to playlists/search)
- v Create `PlayerScreen` (album art, controls, progress bar, speed, equalizer)
- v Create `SearchScreen` (search field, filtered results)
- v Create `PlaylistsScreen` (list, create, open playlist)
- v Create `MusicCard` component
- v Create `PlayerControls` component
- v Create `ProgressBar` component
- v Create `Equalizer` component (bass, mid, treble)
- v Install and configure TanStack Query v5
- v Create QueryClientProvider wrapper
- v Replace usePlayer/usePlaylist hooks with TanStack Query hooks
- v Add TanStack Query DevTools

## Frontend Testing

- v Configure Vitest for mobile (jsdom env, aliases for react-native, automatic JSX runtime)
- v Create `__mocks__/` for react-native, @expo/vector-icons, react-native-safe-area-context, nativewind, expo-constants
- v Switch from @testing-library/react-native to @testing-library/react (DOM-based testing)
- v Write unit tests for `MusicCard` component (8 tests passing)
- v Write unit tests for `PlayerControls` component (15 tests passing)
- v Write unit tests for `ProgressBar` component (14 tests passing)
- v Write unit tests for `AlbumCard` component (16 tests passing)
- v Write unit tests for `Equalizer` component (20 tests passing)
- v Write unit tests for `BottomNav` component (17 tests passing)
- v Write unit tests for `usePlayer` hook (12 tests passing)
- v Write unit tests for `usePlaylist` hook (11 tests passing)
- v Write unit tests for `AppContent` (all screens inline) (11 tests passing)
- v Set up MSW v2 handlers for API mocking
- v Write E2E tests with Detox (player flow) (deferred — requires Android SDK)
- v Write unit tests for TanStack Query hooks (musics, playlists, search) (28 tests passing)
- v Test query invalidation and cache updates
- v Test optimistic updates for playlist mutations

## Design System

- v Define NativeWind config with color tokens
- v Create shared style constants (colors, spacing, typography)
- v Apply dark theme across all screens
- v Verify color tokens match `#0D0D0D`, `#262330`, `#FACC16`, `#FFFFFF`, `#404047`

## Deployment

- v Create build script for backend (`pnpm build` → `tsc`, `pnpm start` → `node dist/server.js`)
- v Create build script for mobile (`eas build --profile preview`, `eas.json` configured)
- v Configure port 3000 for backend (configurable via `PORT` env var)
- v Set up development workflow (`expo start`, `tsx watch`)

## Documentation

- v Write `docs/TESTING.md` with testing guidelines
- v Create `docs/skills/COMMITS_GUIDELINE.md`
- v Create `docs/skills/TESTING_API_GUIDELINE.md`
- v Create `docs/skills/TESTING_FRONTEND_GUIDELINE.md`
- v Create `docs/superpowers/plans/music-streaming-app-design.md`
- v Create `AGENTS.md`

## Additional Features (Backlog)

- v Cover art fetching (Last.fm integration on mobile)
- v Audio playback with expo-av (migrated to expo-audio)
- v Playlist management UI (create, view, navigate)
- v Pull-to-refresh on Biblioteca
- v Buffer lookahead (30s like Spotify)
- v Playlist prefetch (next track pre-loads in background)
- v Cache-Control headers on streaming endpoint
- v Recent searches in SearchScreen (top 10, in-memory)

## Improvements (Backlog)

### P0 — Bugs / UX

- v Auto-advance: play next song when current ends (didJustFinish)
- v Error state in player UI (show error message on stream failure)
- v Buffering indicator (expose isBuffering to UI)

### P1 — Missing Features

- v Remove song from playlist (API + mutation exist, UI missing)
- v Add song to playlist from music list (addMusicToPlaylist unused)
- v Equalizer functional (Android only via native module)

### P2 — Code Quality

- v Extract screens from app-content.tsx (497 → 206 lines, 5 screens extracted)
- v Handle musicsError in UI (error banner + retry on BibliotecaScreen)
- v Remove dead code: use-playlist.ts (superseded by React Query)
- v Remove empty directories: domain/entities, domain/usecases, storage, navigation
- v Integration tests for server routes (supertest)
- x E2E tests with Detox (requires Android SDK)

## Architecture Improvements

### Alta

| Status | Problema | Solução |
|--------|----------|---------|
| v | Scan quebra a camada de aplicação | `ScanMusicLibrary` como caso de uso com `IScannerService` + `IMusicRepository` |
| v | Reescaneamento duplica músicas | ID determinístico (SHA-256 do `filePath`) + unique index no SQLite |
| v | Endpoint de scan aceita qualquer caminho | `POST /scan` usa apenas `MUSIC_PATH` do servidor, sem parâmetro do cliente |

### Média

| Status | Problema | Solução |
|--------|----------|---------|
| v | Rotas ignoram controllers existentes | Rotas delegam a `MusicController` e `PlaylistController` |
| v | Busca por ID ineficiente | `GetMusicById` com `findById` direto no repositório |
| - | Inversão de dependência incompleta | `CoverService` depende de `CoverCacheRepository` concreto — definir `ICoverCacheRepository` |
| - | AppContent "god component" | Mover navegação para React Navigation, extrair `usePlayerQueue` |

### Baixa

| Status | Problema | Solução |
|--------|----------|---------|
| - | Contratos HTTP duplicados | Reutilizar schemas de `shared/` no servidor |
| - | Observabilidade e tratamento de erros | Centralizar `DomainError` no error handler, usar logger do Fastify |

> **Status:** v = concluído | - = pendente

> **Pontos positivos:** Casos de uso dependem de interfaces de repositório. Composition root bem identificado. Mobile valida HTTP com Zod na borda. React Query centraliza cache e invalidação.
