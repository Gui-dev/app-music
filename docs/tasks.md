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

> Principais melhorias, em ordem de prioridade:

| Prioridade | Ponto | Melhoria |
|------------|-------|----------|
| **Alta** | Scan quebra a camada de aplicação | v Criado `ScanMusicLibrary` como caso de uso, dependendo de `IScannerService` e `IMusicRepository`. Rota agora delega ao caso de uso. `apps/server/src/domain/usecases/music/scan-music-library.ts`. |
| **Alta** | Reescaneamento duplica músicas | v ID determinístico derivado de `filePath` via SHA-256. Unique index no `filePath` na tabela. Mesmo arquivo agora tem mesmo ID em todo scan. `apps/server/src/infra/services/scanner-service.ts:52`, `apps/server/src/infra/database/schemas/musics-schema.ts:3`. |
| **Alta** | Endpoint de scan aceita qualquer caminho | v `POST /scan` não aceita mais path do cliente. Usa apenas `MUSIC_PATH` do servidor. Lança erro se não configurado. `apps/server/src/infra/http/routes/scan-routes.ts:5`, `apps/server/src/domain/usecases/music/scan-music-library.ts:19`. |
| **Média** | Rotas ignoram controllers existentes | v Rotas agora delegam a `MusicController` e `PlaylistController`. Controllers centralizam serialização (Date → ISO) e lógica. Rotas ficam finas. `apps/server/src/infra/http/controllers/music-controller.ts:3`, `apps/server/src/infra/http/routes/playlist-routes.ts:5`. |
| **Média** | Busca por ID ineficiente | v Criado `GetMusicById` usando `IMusicRepository.findById`. Cover route agora usa busca direta em vez de carregar toda a biblioteca. `apps/server/src/domain/usecases/music/get-music-by-id.ts:1`, `apps/server/src/infra/http/routes/cover-routes.ts:18`. |
| **Média** | Inversão de dependência incompleta | `CoverService` depende de `CoverCacheRepository` concreto, não de uma porta/contrato. Defina `ICoverCacheRepository` no domínio. `apps/server/src/infra/services/cover-service.ts:1`. |
| **Média** | AppContent está virando "god component" | Ele concentra navegação, estado de player, playlist, busca, modal e transformação de dados. React Navigation já está instalado, mas a navegação é manual. Mover rotas para navigator e extrair um `usePlayerQueue`/estado de playlist reduz props e acoplamento. `apps/mobile/src/app-content.tsx:24`. |
| **Baixa** | Contratos HTTP duplicados | Os schemas Zod compartilhados são usados no mobile, mas o servidor declara schemas equivalentes dentro das rotas. Reutilize os schemas de `shared` e crie schemas específicos de request/response quando necessário. `shared/src/schemas/index.ts:3`, `apps/server/src/infra/http/routes/music-routes.ts:11`. |
| **Baixa** | Observabilidade e tratamento de erros | Há `console.log`, `console.error` e `catch (error: any)` espalhados. Centralize o mapeamento de `DomainError` no error handler e use o logger do Fastify; isso também elimina try/catch repetidos nas rotas. `apps/server/src/infra/http/middleware/error-handler.ts:3`. |

> **Pontos positivos importantes:**
>
> - Casos de uso dependem de interfaces de repositório, o que torna os testes de domínio simples e independentes de SQLite.
> - O composition root está bem identificado em container (`apps/server/src/infra/container/index.ts:33`).
> - O mobile valida respostas HTTP na borda da aplicação com Zod, uma ótima proteção contra contratos inválidos. `apps/mobile/src/infra/api/music-api.ts:31`.
> - React Query está corretamente centralizando cache e invalidação de mutações.

> **Prioridade de execução sugerida:** Corrigir a identidade no scan, encapsular o scan em caso de uso, criar `GetMusicById`, e então decidir definitivamente entre "rotas finas" ou controllers. Isso deixaria a arquitetura muito mais consistente sem exigir uma reescrita.
