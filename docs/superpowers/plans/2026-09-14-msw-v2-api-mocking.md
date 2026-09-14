# MSW v2 API Mocking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up MSW v2 for API mocking in mobile tests, enabling integration-level testing of the full axios → TanStack Query → React component data flow.

**Architecture:** MSW intercepts HTTP requests at the network level in Node.js (vitest environment). Handlers define mock responses for all API endpoints. Tests use `renderHook` from `@testing-library/react` to test hooks with real HTTP interception.

**Tech Stack:** msw v2, vitest, @testing-library/react, @tanstack/react-query

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `apps/mobile/package.json` | Modify | Add `msw` dependency |
| `apps/mobile/src/mocks/handlers.ts` | Create | MSW request handlers for all 8 API endpoints |
| `apps/mobile/src/mocks/server.ts` | Create | `setupServer()` for Node.js |
| `apps/mobile/vitest.setup.ts` | Modify | Add MSW server lifecycle hooks |
| `apps/mobile/src/hooks/queries/use-musics.spec.ts` | Create | MSW tests for `useMusics`, `useMusic`, `useSearchMusics` |
| `apps/mobile/src/hooks/queries/use-playlists.spec.ts` | Create | MSW tests for `usePlaylists` |
| `apps/mobile/src/hooks/mutations/use-playlist-mutations.spec.ts` | Create | MSW tests for mutations with cache invalidation |
| `docs/tasks.md` | Modify | Mark MSW tasks as completed |

---

### Task 1: Install MSW v2

**Files:**
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Install msw**

```bash
cd apps/mobile && pnpm add msw
```

- [ ] **Step 2: Verify installation**

```bash
cd apps/mobile && pnpm exec msw --version
```

Expected: prints msw version (2.x)

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/package.json apps/mobile/pnpm-lock.yaml
git commit -m "chore(mobile): add msw v2 dependency"
```

---

### Task 2: Create MSW handlers

**Files:**
- Create: `apps/mobile/src/mocks/handlers.ts`

- [ ] **Step 1: Create handlers file**

```ts
import { http, HttpResponse } from 'msw'
import type { Music, Playlist } from '../infra/api/music-api'

const mockMusics: Music[] = [
	{
		id: '1',
		title: 'Bohemian Rhapsody',
		artist: 'Queen',
		album: 'A Night at the Opera',
		duration: 354,
		filePath: '/music/bohemian-rhapsody.mp3',
		coverUrl: null,
		trackNumber: 11,
		year: 1975,
	},
	{
		id: '2',
		title: 'Stairway to Heaven',
		artist: 'Led Zeppelin',
		album: 'Led Zeppelin IV',
		duration: 482,
		filePath: '/music/stairway-to-heaven.mp3',
		coverUrl: null,
		trackNumber: 4,
		year: 1971,
	},
	{
		id: '3',
		title: 'Hotel California',
		artist: 'Eagles',
		album: 'Hotel California',
		duration: 391,
		filePath: '/music/hotel-california.mp3',
		coverUrl: null,
		trackNumber: 5,
		year: 1977,
	},
]

const mockPlaylists: Playlist[] = [
	{
		id: '1',
		name: 'Rock Classics',
		musicIds: ['1', '2'],
		createdAt: '2024-01-15T10:00:00Z',
		updatedAt: '2024-01-15T10:00:00Z',
	},
	{
		id: '2',
		name: 'Chill Vibes',
		musicIds: ['3'],
		createdAt: '2024-02-20T14:30:00Z',
		updatedAt: '2024-02-20T14:30:00Z',
	},
]

export { mockMusics, mockPlaylists }

export const handlers = [
	http.get('*/music', () => {
		return HttpResponse.json(mockMusics)
	}),

	http.get('*/music/:id', ({ params }) => {
		const music = mockMusics.find((m) => m.id === params.id)
		if (!music) {
			return new HttpResponse(null, { status: 404 })
		}
		return HttpResponse.json(music)
	}),

	http.get('*/search', ({ request }) => {
		const url = new URL(request.url)
		const query = url.searchParams.get('q')?.toLowerCase() ?? ''
		const filtered = mockMusics.filter(
			(m) =>
				m.title.toLowerCase().includes(query) ||
				m.artist.toLowerCase().includes(query) ||
				m.album.toLowerCase().includes(query),
		)
		return HttpResponse.json(filtered)
	}),

	http.get('*/playlists', () => {
		return HttpResponse.json(mockPlaylists)
	}),

	http.post('*/playlists', async ({ request }) => {
		const body = (await request.json()) as { name: string }
		const newPlaylist: Playlist = {
			id: String(mockPlaylists.length + 1),
			name: body.name,
			musicIds: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
		mockPlaylists.push(newPlaylist)
		return HttpResponse.json(newPlaylist, { status: 201 })
	}),

	http.post('*/playlists/:id/add', async ({ params, request }) => {
		const body = (await request.json()) as { musicId: string }
		const playlist = mockPlaylists.find((p) => p.id === params.id)
		if (!playlist) {
			return new HttpResponse(null, { status: 404 })
		}
		playlist.musicIds.push(body.musicId)
		playlist.updatedAt = new Date().toISOString()
		return new HttpResponse(null, { status: 204 })
	}),

	http.delete('*/playlists/:id/remove/:musicId', ({ params }) => {
		const playlist = mockPlaylists.find((p) => p.id === params.id)
		if (!playlist) {
			return new HttpResponse(null, { status: 404 })
		}
		playlist.musicIds = playlist.musicIds.filter((id) => id !== params.musicId)
		playlist.updatedAt = new Date().toISOString()
		return new HttpResponse(null, { status: 204 })
	}),

	http.post('*/scan', () => {
		return HttpResponse.json({ count: mockMusics.length, message: 'Scan complete' })
	}),
]
```

- [ ] **Step 2: Run biome check**

```bash
pnpm biome check apps/mobile/src/mocks/handlers.ts
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/mocks/handlers.ts
git commit -m "feat(mobile): add MSW v2 handlers for all API endpoints"
```

---

### Task 3: Create MSW server and configure vitest

**Files:**
- Create: `apps/mobile/src/mocks/server.ts`
- Modify: `apps/mobile/vitest.setup.ts`

- [ ] **Step 1: Create server.ts**

```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

- [ ] **Step 2: Update vitest.setup.ts**

```ts
import '@testing-library/jest-dom/vitest'
import { server } from './src/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 3: Run existing tests to verify no regressions**

```bash
cd apps/mobile && pnpm test --run
```

Expected: all 124 existing tests still pass (MSW server is set up but not used by existing tests)

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/mocks/server.ts apps/mobile/vitest.setup.ts
git commit -m "feat(mobile): configure MSW server in vitest setup"
```

---

### Task 4: Write MSW tests for useMusics hooks

**Files:**
- Create: `apps/mobile/src/hooks/queries/use-musics.spec.ts`

- [ ] **Step 1: Create test file**

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useMusics, useMusic, useSearchMusics } from './use-musics'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'
import { mockMusics } from '../../mocks/handlers'

function createQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
}

function createWrapper() {
	const queryClient = createQueryClient()
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		)
	}
}

describe('useMusics', () => {
	it('fetches music list successfully', async () => {
		const { result } = renderHook(() => useMusics(), {
			wrapper: createWrapper(),
		})

		expect(result.current.isLoading).toBe(true)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(mockMusics)
	})

	it('handles error state', async () => {
		server.use(
			http.get('*/music', () => {
				return new HttpResponse(null, { status: 500 })
			}),
		)

		const { result } = renderHook(() => useMusics(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isError).toBe(true))

		expect(result.current.error).toBeTruthy()
	})
})

describe('useMusic', () => {
	it('fetches a single music by id', async () => {
		const { result } = renderHook(() => useMusic('1'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(mockMusics[0])
	})

	it('does not fetch when id is empty', () => {
		const { result } = renderHook(() => useMusic(''), {
			wrapper: createWrapper(),
		})

		expect(result.current.fetchStatus).toBe('idle')
	})

	it('returns 404 for nonexistent music', async () => {
		const { result } = renderHook(() => useMusic('999'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isError).toBe(true))

		expect(result.current.error).toBeTruthy()
	})
})

describe('useSearchMusics', () => {
	it('searches musics by query', async () => {
		const { result } = renderHook(() => useSearchMusics('queen'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual([mockMusics[0]])
	})

	it('does not search when query is empty', () => {
		const { result } = renderHook(() => useSearchMusics(''), {
			wrapper: createWrapper(),
		})

		expect(result.current.fetchStatus).toBe('idle')
	})

	it('returns empty array for no matches', async () => {
		const { result } = renderHook(() => useSearchMusics('nonexistent'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual([])
	})
})
```

- [ ] **Step 2: Run tests**

```bash
cd apps/mobile && pnpm vitest run src/hooks/queries/use-musics.spec.ts
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/hooks/queries/use-musics.spec.ts
git commit -m "test(mobile): add MSW tests for useMusics hooks"
```

---

### Task 5: Write MSW tests for usePlaylists hook

**Files:**
- Create: `apps/mobile/src/hooks/queries/use-playlists.spec.ts`

- [ ] **Step 1: Create test file**

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { usePlaylists } from './use-playlists'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'
import { mockPlaylists } from '../../mocks/handlers'

function createQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
}

function createWrapper() {
	const queryClient = createQueryClient()
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		)
	}
}

describe('usePlaylists', () => {
	it('fetches playlists successfully', async () => {
		const { result } = renderHook(() => usePlaylists(), {
			wrapper: createWrapper(),
		})

		expect(result.current.isLoading).toBe(true)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(mockPlaylists)
	})

	it('handles error state', async () => {
		server.use(
			http.get('*/playlists', () => {
				return new HttpResponse(null, { status: 500 })
			}),
		)

		const { result } = renderHook(() => usePlaylists(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isError).toBe(true))

		expect(result.current.error).toBeTruthy()
	})
})
```

- [ ] **Step 2: Run tests**

```bash
cd apps/mobile && pnpm vitest run src/hooks/queries/use-playlists.spec.ts
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/hooks/queries/use-playlists.spec.ts
git commit -m "test(mobile): add MSW tests for usePlaylists hook"
```

---

### Task 6: Write MSW tests for playlist mutations

**Files:**
- Create: `apps/mobile/src/hooks/mutations/use-playlist-mutations.spec.ts`

- [ ] **Step 1: Create test file**

```ts
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
	useCreatePlaylist,
	useAddMusicToPlaylist,
	useRemoveMusicFromPlaylist,
	useScanDirectory,
} from './use-playlist-mutations'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'
import { mockMusics, mockPlaylists } from '../../mocks/handlers'

function createQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
}

function createWrapper() {
	const queryClient = createQueryClient()
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		)
	}
}

describe('useCreatePlaylist', () => {
	it('creates a playlist successfully', async () => {
		const { result } = renderHook(() => useCreatePlaylist(), {
			wrapper: createWrapper(),
		})

		await act(async () => {
			await result.current.mutateAsync('New Playlist')
		})

		expect(result.current.isSuccess).toBe(true)
	})

	it('handles error on creation failure', async () => {
		server.use(
			http.post('*/playlists', () => {
				return new HttpResponse(null, { status: 500 })
			}),
		)

		const { result } = renderHook(() => useCreatePlaylist(), {
			wrapper: createWrapper(),
		})

		await act(async () => {
			try {
				await result.current.mutateAsync('Fail Playlist')
			} catch {}
		})

		expect(result.current.isError).toBe(true)
	})
})

describe('useAddMusicToPlaylist', () => {
	it('adds music to playlist successfully', async () => {
		const { result } = renderHook(() => useAddMusicToPlaylist(), {
			wrapper: createWrapper(),
		})

		await act(async () => {
			await result.current.mutateAsync({
				playlistId: mockPlaylists[0].id,
				musicId: mockMusics[2].id,
			})
		})

		expect(result.current.isSuccess).toBe(true)
	})

	it('handles 404 for nonexistent playlist', async () => {
		const { result } = renderHook(() => useAddMusicToPlaylist(), {
			wrapper: createWrapper(),
		})

		await act(async () => {
			try {
				await result.current.mutateAsync({
					playlistId: '999',
					musicId: mockMusics[0].id,
				})
			} catch {}
		})

		expect(result.current.isError).toBe(true)
	})
})

describe('useRemoveMusicFromPlaylist', () => {
	it('removes music from playlist successfully', async () => {
		const { result } = renderHook(() => useRemoveMusicFromPlaylist(), {
			wrapper: createWrapper(),
		})

		await act(async () => {
			await result.current.mutateAsync({
				playlistId: mockPlaylists[0].id,
				musicId: mockMusics[0].id,
			})
		})

		expect(result.current.isSuccess).toBe(true)
	})
})

describe('useScanDirectory', () => {
	it('triggers scan successfully', async () => {
		const { result } = renderHook(() => useScanDirectory(), {
			wrapper: createWrapper(),
		})

		await act(async () => {
			await result.current.mutateAsync('/music')
		})

		expect(result.current.isSuccess).toBe(true)
		expect(result.current.data).toEqual({
			count: mockMusics.length,
			message: 'Scan complete',
		})
	})
})
```

- [ ] **Step 2: Run tests**

```bash
cd apps/mobile && pnpm vitest run src/hooks/mutations/use-playlist-mutations.spec.ts
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/hooks/mutations/use-playlist-mutations.spec.ts
git commit -m "test(mobile): add MSW tests for playlist mutations"
```

---

### Task 7: Full verification and tasks.md update

**Files:**
- Modify: `docs/tasks.md`

- [ ] **Step 1: Run full test suite**

```bash
cd apps/mobile && pnpm test --run
```

Expected: all tests pass (124 existing + ~20 new MSW tests)

- [ ] **Step 2: Run biome check**

```bash
pnpm biome check apps/mobile/src/mocks/ apps/mobile/src/hooks/
```

Expected: no errors

- [ ] **Step 3: Update tasks.md**

Mark the MSW task as completed:

```diff
-- x Set up MSW v2 handlers for API mocking
+- v Set up MSW v2 handlers for API mocking
```

- [ ] **Step 4: Commit**

```bash
git add docs/tasks.md
git commit -m "docs: mark MSW v2 setup as completed in tasks"
```
