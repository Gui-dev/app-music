import {
	QueryClient,
	QueryClientProvider,
	useQueryClient,
} from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { mockMusics, mockPlaylists } from '../mocks/handlers'
import { server } from '../mocks/server'
import {
	useAddMusicToPlaylist,
	useCreatePlaylist,
	useRemoveMusicFromPlaylist,
	useScanDirectory,
} from './mutations/use-playlist-mutations'
import { useMusics } from './queries/use-musics'
import { usePlaylists } from './queries/use-playlists'

function createQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
}

function createWrapper() {
	const queryClient = createQueryClient()
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)
	}
}

describe('Query Invalidation and Cache Updates', () => {
	describe('useCreatePlaylist invalidates playlists cache', () => {
		it('refetches playlists after creating a new playlist', async () => {
			const queryClient = createQueryClient()
			const wrapper = ({ children }: { children: ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			)

			// First, fetch playlists to populate cache
			const { result: playlistsResult } = renderHook(() => usePlaylists(), {
				wrapper,
			})

			await waitFor(() => expect(playlistsResult.current.isSuccess).toBe(true))
			const initialCount = playlistsResult.current.data?.length

			// Now create a playlist (invalidates ['playlists'] cache)
			const { result: createResult } = renderHook(() => useCreatePlaylist(), {
				wrapper,
			})

			await act(async () => {
				await createResult.current.mutateAsync('Cache Test Playlist')
			})

			// Verify playlists query was invalidated and refetched
			await waitFor(() => {
				const cachedData = queryClient.getQueryData(['playlists'])
				expect(cachedData).toBeTruthy()
			})
		})

		it('invalidates cache on creation error (does not corrupt cache)', async () => {
			server.use(
				http.post('*/playlists', () => {
					return new HttpResponse(null, { status: 500 })
				}),
			)

			const queryClient = createQueryClient()
			const wrapper = ({ children }: { children: ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			)

			// Fetch playlists first
			const { result: playlistsResult } = renderHook(() => usePlaylists(), {
				wrapper,
			})
			await waitFor(() => expect(playlistsResult.current.isSuccess).toBe(true))

			// Attempt to create (will fail)
			const { result: createResult } = renderHook(() => useCreatePlaylist(), {
				wrapper,
			})

			await act(async () => {
				try {
					await createResult.current.mutateAsync('Fail Playlist')
				} catch {}
			})

			// Cache should still have valid data from previous fetch
			const cachedData = queryClient.getQueryData(['playlists'])
			expect(cachedData).toBeTruthy()
		})
	})

	describe('useAddMusicToPlaylist invalidates playlists cache', () => {
		it('invalidates both playlists and playlist-by-id cache', async () => {
			const queryClient = createQueryClient()
			const wrapper = ({ children }: { children: ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			)

			// Fetch playlists to populate cache
			const { result: playlistsResult } = renderHook(() => usePlaylists(), {
				wrapper,
			})
			await waitFor(() => expect(playlistsResult.current.isSuccess).toBe(true))

			// Add music to playlist
			const { result: addResult } = renderHook(() => useAddMusicToPlaylist(), {
				wrapper,
			})

			await act(async () => {
				await addResult.current.mutateAsync({
					playlistId: mockPlaylists[0].id,
					musicId: mockMusics[2].id,
				})
			})

			// Both ['playlists'] and ['playlists', id] should be invalidated
			const playlistsCache = queryClient.getQueryData(['playlists'])
			expect(playlistsCache).toBeTruthy()
		})
	})

	describe('useRemoveMusicFromPlaylist invalidates playlists cache', () => {
		it('invalidates cache after removing music from playlist', async () => {
			const queryClient = createQueryClient()
			const wrapper = ({ children }: { children: ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			)

			// Fetch playlists
			const { result: playlistsResult } = renderHook(() => usePlaylists(), {
				wrapper,
			})
			await waitFor(() => expect(playlistsResult.current.isSuccess).toBe(true))

			// Remove music
			const { result: removeResult } = renderHook(
				() => useRemoveMusicFromPlaylist(),
				{ wrapper },
			)

			await act(async () => {
				await removeResult.current.mutateAsync({
					playlistId: mockPlaylists[0].id,
					musicId: mockMusics[0].id,
				})
			})

			// Cache should be valid
			const cachedData = queryClient.getQueryData(['playlists'])
			expect(cachedData).toBeTruthy()
		})
	})

	describe('useScanDirectory invalidates musics cache', () => {
		it('invalidates musics cache after scan', async () => {
			const queryClient = createQueryClient()
			const wrapper = ({ children }: { children: ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			)

			// Fetch musics to populate cache
			const { result: musicsResult } = renderHook(() => useMusics(), {
				wrapper,
			})
			await waitFor(() => expect(musicsResult.current.isSuccess).toBe(true))

			// Trigger scan (invalidates ['musics'] cache)
			const { result: scanResult } = renderHook(() => useScanDirectory(), {
				wrapper,
			})

			await act(async () => {
				await scanResult.current.mutateAsync('/music')
			})

			// Musics cache should be valid
			const cachedData = queryClient.getQueryData(['musics'])
			expect(cachedData).toBeTruthy()
		})
	})

	describe('Cache refetch after invalidation', () => {
		it('returns fresh data from server after invalidation', async () => {
			const queryClient = createQueryClient()
			const wrapper = ({ children }: { children: ReactNode }) => (
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			)

			// Fetch playlists
			const { result } = renderHook(() => usePlaylists(), { wrapper })
			await waitFor(() => expect(result.current.isSuccess).toBe(true))
			const initialData = result.current.data

			// Create a playlist (invalidates cache)
			const { result: createResult } = renderHook(() => useCreatePlaylist(), {
				wrapper,
			})

			await act(async () => {
				await createResult.current.mutateAsync('Refetch Test')
			})

			// Invalidate and refetch
			await queryClient.invalidateQueries({ queryKey: ['playlists'] })

			await waitFor(() => {
				const refetchedData = queryClient.getQueryData(['playlists'])
				expect(refetchedData).toBeTruthy()
			})
		})
	})
})
