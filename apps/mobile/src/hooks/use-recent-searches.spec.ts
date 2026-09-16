import { act, renderHook } from '@testing-library/react'
import type { Music } from '../infra/api/music-api'
import { useRecentSearches, _resetRecentSearchesForTesting } from './use-recent-searches'

const mockMusic: Music = {
	id: '1',
	title: 'Test Song',
	artist: 'Test Artist',
	album: 'Test Album',
	duration: 200,
	coverUrl: null,
	trackNumber: 1,
	year: 2024,
}

describe('useRecentSearches', () => {
	beforeEach(() => {
		_resetRecentSearchesForTesting()
	})

	it('starts with empty list', () => {
		const { result } = renderHook(() => useRecentSearches())
		expect(result.current.recentSearches).toEqual([])
	})

	it('saves a music to recent searches', async () => {
		const { result } = renderHook(() => useRecentSearches())

		await act(async () => {
			await result.current.addRecentSearch(mockMusic)
		})

		expect(result.current.recentSearches).toEqual([mockMusic])
	})

	it('keeps only the last 10 items', async () => {
		const { result } = renderHook(() => useRecentSearches())

		for (let i = 1; i <= 12; i++) {
			await act(async () => {
				await result.current.addRecentSearch({ ...mockMusic, id: String(i) })
			})
		}

		expect(result.current.recentSearches).toHaveLength(10)
		expect(result.current.recentSearches[0].id).toBe('12')
		expect(result.current.recentSearches[9].id).toBe('3')
	})

	it('moves duplicate to top instead of adding again', async () => {
		const { result } = renderHook(() => useRecentSearches())

		await act(async () => {
			await result.current.addRecentSearch({ ...mockMusic, id: '1' })
		})
		await act(async () => {
			await result.current.addRecentSearch({ ...mockMusic, id: '2' })
		})
		await act(async () => {
			await result.current.addRecentSearch({ ...mockMusic, id: '1' })
		})

		expect(result.current.recentSearches).toHaveLength(2)
		expect(result.current.recentSearches[0].id).toBe('1')
		expect(result.current.recentSearches[1].id).toBe('2')
	})

	it('clears all recent searches', async () => {
		const { result } = renderHook(() => useRecentSearches())

		await act(async () => {
			await result.current.addRecentSearch(mockMusic)
		})

		await act(async () => {
			await result.current.clearRecentSearches()
		})

		expect(result.current.recentSearches).toEqual([])
	})
})
