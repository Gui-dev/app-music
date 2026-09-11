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
- x Create API routes: `/playlists`, `/playlists/:id/add`, `/playlists/:id/remove/:musicId`
- x Create API route: `/scan`
- x Create controllers (MusicController, PlaylistController)
- x Add `@fastify/cors` for cross-origin requests
- x Add error handling middleware

## Backend Testing

- x Write unit tests for `ListMusics` use case
- x Write unit tests for `StreamMusic` use case
- x Write unit tests for `SearchMusics` use case
- x Write unit tests for `CreatePlaylist` use case
- x Write unit tests for `AddMusicToPlaylist` use case
- x Write unit tests for `ListPlaylists` use case
- x Write unit tests for `RemoveMusicFromPlaylist` use case
- x Write repository tests with in-memory SQLite
- x Write integration tests for routes (supertest)
- x Write in-memory repository tests

## Frontend

- x Initialize Expo project with NativeWind
- x Configure Zod for frontend schema validation
- x Set up React Navigation (stack + tab navigators)
- x Create `AudioPlayer` service using `expo-av`
- x Create `MusicApi` service with axios
- x Create `usePlayer` hook
- x Create `usePlaylist` hook
- x Create `AppNavigator`
- x Create `HomeScreen` (music list, navigation to playlists/search)
- x Create `PlayerScreen` (album art, controls, progress bar, speed, equalizer)
- x Create `SearchScreen` (search field, filtered results)
- x Create `PlaylistsScreen` (list, create, open playlist)
- x Create `MusicCard` component
- x Create `PlayerControls` component
- x Create `ProgressBar` component
- x Create `Equalizer` component (bass, mid, treble)

## Frontend Testing

- x Write unit tests for `MusicCard` component
- x Write unit tests for `PlayerControls` component
- x Write unit tests for `ProgressBar` component
- x Write unit tests for `usePlayer` hook
- x Write unit tests for `usePlaylist` hook
- x Write unit tests for `HomeScreen`
- x Write unit tests for `PlayerScreen`
- x Write unit tests for `SearchScreen`
- x Write unit tests for `PlaylistsScreen`
- x Set up MSW v2 handlers for API mocking
- x Write E2E tests with Detox (player flow)

## Design System

- x Define NativeWind config with color tokens
- x Create shared style constants (colors, spacing, typography)
- x Apply dark theme across all screens
- x Verify color tokens match `#0D0D0D`, `#262330`, `#FACC16`, `#FFFFFF`, `#404047`

## Deployment

- x Create build script for backend (`node dist/server.js`)
- x Create build script for mobile (`eas build --profile preview`)
- x Configure port 3000 for backend
- x Set up development workflow (`expo start`, `tsx watch`)

## Documentation

- v Write `docs/TESTING.md` with testing guidelines
- v Create `docs/skills/COMMITS_GUIDELINE.md`
- v Create `docs/skills/TESTING_API_GUIDELINE.md`
- v Create `docs/skills/TESTING_FRONTEND_GUIDELINE.md`
- v Create `docs/superpowers/plans/music-streaming-app-design.md`
- v Create `AGENTS.md`
