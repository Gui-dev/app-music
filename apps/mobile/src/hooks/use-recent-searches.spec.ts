import { act, renderHook, waitFor } from '@testing-library/react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRecentSearches } from './use-recent-searches'

vi.mock('@react-native-async-storage/async-storage', () => ({
	default: {
		getItem: vi.fn().mockResolvedValue(null),
		setItem: vi.fn().mockResolvedValue(undefined),
	},
}))

const mockMusic = {
	id: '1',
	title: 'Test Song',
	artist: 'Test Artist',
	album: 'Test Album',
	duration: 200,
	coverUrl: null,
	filePath: '/test.mp3',
}

beforeEach(() => {
	vi.clearAllMocks()
})

it('loads recent searches from storage on mount', async () => {
	const stored = JSON.stringify([mockMusic])
	vi.mocked(AsyncStorage.getItem).mockResolvedValue(stored)

	const { result } = renderHook(() => useRecentSearches())

	await waitFor(() => {
		expect(result.current.recentSearches).toEqual([mockMusic])
	})

	expect(AsyncStorage.getItem).toHaveBeenCalledWith('@app-music/recent-searches')
})

it('saves a music to recent searches', async () => {
	const { result } = renderHook(() => useRecentSearches())

	await waitFor(() => {
		expect(result.current.recentSearches).toEqual([])
	})

	await act(async () => {
		await result.current.addRecentSearch(mockMusic)
	})

	expect(result.current.recentSearches).toEqual([mockMusic])
	expect(AsyncStorage.setItem).toHaveBeenCalledWith(
		'@app-music/recent-searches',
		JSON.stringify([mockMusic]),
	)
})

it('keeps only the last 10 items', async () => {
	const { result } = renderHook(() => useRecentSearches())

	await waitFor(() => {
		expect(result.current.recentSearches).toEqual([])
	})

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

	await waitFor(() => {
		expect(result.current.recentSearches).toEqual([])
	})

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

	await waitFor(() => {
		expect(result.current.recentSearches).toEqual([])
	})

	await act(async () => {
		await result.current.addRecentSearch(mockMusic)
	})

	await act(async () => {
		await result.current.clearRecentSearches()
	})

	expect(result.current.recentSearches).toEqual([])
	expect(AsyncStorage.setItem).toHaveBeenCalledWith(
		'@app-music/recent-searches',
		'[]',
	)
})
