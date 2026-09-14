# MSW v2 API Mocking Setup

## Goal

Set up MSW (Mock Service Worker) v2 for API mocking in the mobile app's Vitest tests, enabling integration-level testing of the full axios → TanStack Query → React component data flow.

## Current State

- Tests mock hooks directly (`vi.mock('./hooks/queries/use-musics')`) — fast but skips HTTP layer
- API client: `music-api.ts` uses axios with base URL from `expo-constants`
- 8 API endpoints: musics, playlists, search, scan
- Vitest runs in jsdom env with Node.js http module (MSW v2 intercepts this)

## Design

### File Structure

```
apps/mobile/src/mocks/
├── handlers.ts    # MSW request handlers for all API endpoints
└── server.ts      # setupServer() for Node.js test environment
```

### handlers.ts

Defines handlers using `http.get()`, `http.post()`, `http.delete()` from `msw`. Returns `HttpResponse.json()` with realistic mock data matching `Music` and `Playlist` interfaces.

**Endpoints:**

| Method | URL Pattern | Handler |
|--------|-------------|---------|
| GET | `/music` | Returns array of mock musics |
| GET | `/music/:id` | Returns single mock music by id |
| GET | `/search?q=` | Returns filtered musics by query |
| GET | `/playlists` | Returns array of mock playlists |
| POST | `/playlists` | Creates playlist, returns it |
| POST | `/playlists/:id/add` | Adds music to playlist (204) |
| DELETE | `/playlists/:id/remove/:musicId` | Removes music (204) |
| POST | `/scan` | Returns scan result |

**Mock data:** Hardcoded arrays of `Music[]` and `Playlist[]` matching the interfaces from `music-api.ts`.

### server.ts

```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### vitest.setup.ts

```ts
import '@testing-library/jest-dom/vitest'
import { server } from './src/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

`onUnhandledRequest: 'error'` catches any API call not covered by handlers — fails the test explicitly.

### New Test Files

**`src/hooks/queries/use-musics.spec.ts`**
- `useMusics`: Fetches `/music`, returns data, handles loading/error states
- `useMusic`: Fetches `/music/:id`, enabled only with valid id
- `useSearchMusics`: Fetches `/search?q=`, enabled only with non-empty query

**`src/hooks/queries/use-playlists.spec.ts`**
- `usePlaylists`: Fetches `/playlists`, returns data, handles loading/error

**`src/hooks/mutations/use-playlist-mutations.spec.ts`**
- `useCreatePlaylist`: POSTs to `/playlists`, invalidates `['playlists']` cache
- `useAddMusicToPlaylist`: POSTs to `/playlists/:id/add`, invalidates cache
- `useRemoveMusicFromPlaylist`: DELETEs from `/playlists/:id/remove/:musicId`, invalidates cache
- `useScanDirectory`: POSTs to `/scan`, invalidates `['musics']` cache

### Testing Pattern

Each test wraps the hook in a `QueryClientProvider` and uses `renderHook` from `@testing-library/react`:

```ts
const { result, waitFor } = renderHook(() => useMusics(), { wrapper })
await waitFor(() => expect(result.current.isSuccess).toBe(true))
expect(result.current.data).toEqual(mockMusics)
```

MSW handlers can be overridden per-test using `server.use()` for error scenarios.

### What Stays Unchanged

- All 9 existing test files (124 tests) — component tests mock hooks for isolation
- `use-player.spec.ts`, `use-playlist.spec.ts` — fast unit tests with mocked audioPlayer/musicApi
- `app-content.spec.tsx` — mocks hooks for screen navigation testing

## Dependencies

- `msw@latest` (v2) — only new dependency

## Verification

1. `pnpm test --run` — all existing 124 tests still pass
2. New MSW tests pass (estimated ~20-25 new tests)
3. `pnpm biome check` — clean
4. `onUnhandledRequest: 'error'` catches unmocked endpoints
