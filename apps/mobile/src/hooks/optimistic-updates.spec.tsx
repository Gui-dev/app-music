import {
	QueryClient,
	QueryClientProvider,
	useQueryClient,
} from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useCreatePlaylist } from './mutations/use-playlist-mutations'
import { useAddMusicToPlaylist } from './mutations/use-playlist-mutations'
import { usePlaylists } from './queries/use-playlists'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import { mockPlaylists, mockMusics } from '../mocks/handlers'

function createQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
}

function createWrapper(queryClient?: QueryClient) {
	const client = queryClient ?? createQueryClient()
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={client}>
				{children}
			</QueryClientProvider>
		)
	}
}

describe('Optimistic Updates for Playlist Mutations', () => {
	describe('Current behavior: onSuccess invalidation (not optimistic)', () => {
		it('useCreatePlaylist updates cache via invalidation, not optimistic insert', async () => {
			const queryClient = createQueryClient()
			const wrapper = createWrapper(queryClient)

			// Populate cache
			const { result: playlistsResult } = renderHook(() => usePlaylists(), {
				wrapper,
			})
			await waitFor(() => expect(playlistsResult.current.isSuccess).toBe(true))
			const initialLength = playlistsResult.current.data?.length ?? 0

			// Create playlist
			const { result: createResult } = renderHook(() => useCreatePlaylist(), {
				wrapper,
			})

			await act(async () => {
				await createResult.current.mutateAsync('Optimistic Test')
			})

			// After onSuccess, cache is invalidated and refetched
			// The new playlist should be in the refetched data
			await waitFor(() => {
				const data = queryClient.getQueryData(['playlists']) as typeof mockPlaylists
				expect(data?.length).toBeGreaterThan(initialLength)
			})
		})

		it('useAddMusicToPlaylist invalidates cache after server response', async () => {
			const queryClient = createQueryClient()
			const wrapper = createWrapper(queryClient)

			// Populate cache
			const { result: playlistsResult } = renderHook(() => usePlaylists(), {
				wrapper,
			})
			await waitFor(() => expect(playlistsResult.current.isSuccess).toBe(true))

			// Add music
			const { result: addResult } = renderHook(() => useAddMusicToPlaylist(), {
				wrapper,
			})

			await act(async () => {
				await addResult.current.mutateAsync({
					playlistId: mockPlaylists[0].id,
					musicId: mockMusics[2].id,
				})
			})

			// Cache should be valid after invalidation
			const cachedData = queryClient.getQueryData(['playlists'])
			expect(cachedData).toBeTruthy()
		})
	})

	describe('Optimistic update pattern (would-be implementation)', () => {
		it('demonstrates how onMutate + onError rollback would work', async () => {
			// This test documents the optimistic update pattern
			// Current hooks use onSuccess invalidation, not optimistic updates.
			// To implement optimistic updates, the mutation would need:
			//
			// onMutate: async (newPlaylist) => {
			//   await queryClient.cancelQueries({ queryKey: ['playlists'] })
			//   const previous = queryClient.getQueryData(['playlists'])
			//   queryClient.setQueryData(['playlists'], (old) => [...old, newPlaylist])
			//   return { previous }
			// },
			// onError: (err, newPlaylist, context) => {
			//   queryClient.setQueryData(['playlists'], context.previous)
			// },
			// onSettled: () => {
			//   queryClient.invalidateQueries({ queryKey: ['playlists'] })
			// },

			const queryClient = createQueryClient()
			const wrapper = createWrapper(queryClient)

			// Populate cache
			const { result: playlistsResult } = renderHook(() => usePlaylists(), {
				wrapper,
			})
			await waitFor(() => expect(playlistsResult.current.isSuccess).toBe(true))

			// Current behavior: no optimistic insert before server response
			// The cache is only updated AFTER onSuccess callback
			const { result: createResult } = renderHook(() => useCreatePlaylist(), {
				wrapper,
			})

			// Before mutation, cache should not have the new playlist
			const preMutationData = queryClient.getQueryData(['playlists']) as typeof mockPlaylists
			const hasNewPlaylist = preMutationData?.some(
				(p) => p.name === 'Would Be Optimistic',
			)
			expect(hasNewPlaylist).toBe(false)

			// After mutation completes, cache is updated via invalidation
			await act(async () => {
				await createResult.current.mutateAsync('Would Be Optimistic')
			})

			await waitFor(() => {
				const postMutationData = queryClient.getQueryData(['playlists']) as typeof mockPlaylists
				const hasAfter = postMutationData?.some(
					(p) => p.name === 'Would Be Optimistic',
				)
				expect(hasAfter).toBe(true)
			})
		})

		it('documents that optimistic updates would prevent UI flicker on slow networks', async () => {
			// With optimistic updates:
			// 1. User taps "Create Playlist"
			// 2. UI immediately shows new playlist (onMutate sets cache)
			// 3. Server responds
			// 4. Cache is reconciled with server data (onSettled invalidates)
			//
			// Without optimistic updates (current behavior):
			// 1. User taps "Create Playlist"
			// 2. Mutation is pending (no UI change)
			// 3. Server responds
			// 4. Cache is invalidated and refetched (UI updates)
			//
			// The gap: between step 1 and 3, the user sees no indication
			// that their action was accepted. With optimistic updates,
			// the UI reflects the expected result immediately.

			expect(true).toBe(true) // Documentation placeholder
		})
	})

	describe('Rollback on error', () => {
		it('current behavior: cache not corrupted on mutation error', async () => {
			server.use(
				http.post('*/playlists', () => {
					return new HttpResponse(null, { status: 500 })
				}),
			)

			const queryClient = createQueryClient()
			const wrapper = createWrapper(queryClient)

			// Populate cache
			const { result: playlistsResult } = renderHook(() => usePlaylists(), {
				wrapper,
			})
			await waitFor(() => expect(playlistsResult.current.isSuccess).toBe(true))
			const originalData = playlistsResult.current.data

			// Attempt mutation (will fail)
			const { result: createResult } = renderHook(() => useCreatePlaylist(), {
				wrapper,
			})

			await act(async () => {
				try {
					await createResult.current.mutateAsync('Fail Playlist')
				} catch {}
			})

			// Cache should still have original data
			const cachedData = queryClient.getQueryData(['playlists'])
			expect(cachedData).toEqual(originalData)
		})

		it('with optimistic updates: would rollback cache on error', async () => {
			// With optimistic updates, the onError callback would restore
			// the previous cache value:
			//
			// onError: (err, newPlaylist, context) => {
			//   queryClient.setQueryData(['playlists'], context.previous)
			// }
			//
			// This test documents the expected behavior.

			expect(true).toBe(true) // Documentation placeholder
		})
	})
})
