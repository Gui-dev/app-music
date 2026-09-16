import { useCallback, useState } from 'react'
import type { Music } from '../infra/api/music-api'

const MAX_ITEMS = 10

let memoryStore: Music[] = []

export function useRecentSearches() {
	const [recentSearches, setRecentSearches] = useState<Music[]>(memoryStore)

	const addRecentSearch = useCallback(async (music: Music) => {
		setRecentSearches((prev) => {
			const filtered = prev.filter((m) => m.id !== music.id)
			const updated = [music, ...filtered].slice(0, MAX_ITEMS)
			memoryStore = updated
			return updated
		})
	}, [])

	const clearRecentSearches = useCallback(() => {
		memoryStore = []
		setRecentSearches([])
	}, [])

	return { recentSearches, addRecentSearch, clearRecentSearches }
}

export function _resetRecentSearchesForTesting() {
	memoryStore = []
}
