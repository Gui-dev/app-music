import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { mockMusics, mockPlaylists } from '../../mocks/handlers'
import { server } from '../../mocks/server'
import {
	useAddMusicToPlaylist,
	useCreatePlaylist,
	useRemoveMusicFromPlaylist,
	useScanDirectory,
} from './use-playlist-mutations'

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

describe('useCreatePlaylist', () => {
	it('creates a playlist successfully', async () => {
		const { result } = renderHook(() => useCreatePlaylist(), {
			wrapper: createWrapper(),
		})

		await act(async () => {
			await result.current.mutateAsync('New Playlist')
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
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

		await waitFor(() => expect(result.current.isError).toBe(true))
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

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
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

		await waitFor(() => expect(result.current.isError).toBe(true))
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

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
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

		await waitFor(() => expect(result.current.isSuccess).toBe(true))
		expect(result.current.data).toEqual({
			count: mockMusics.length,
			message: 'Scan complete',
		})
	})
})
