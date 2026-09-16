import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Music } from '../infra/api/music-api'

const STORAGE_KEY = '@app-music/recent-searches'
const MAX_ITEMS = 10

export function useRecentSearches() {
	const [recentSearches, setRecentSearches] = useState<Music[]>([])

	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
			if (raw) {
				setRecentSearches(JSON.parse(raw))
			}
		})
	}, [])

	const persist = useCallback((list: Music[]) => {
		setRecentSearches(list)
		AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))
	}, [])

	const addRecentSearch = useCallback(
		async (music: Music) => {
			const filtered = recentSearches.filter((m) => m.id !== music.id)
			const updated = [music, ...filtered].slice(0, MAX_ITEMS)
			persist(updated)
		},
		[recentSearches, persist],
	)

	const clearRecentSearches = useCallback(() => {
		persist([])
	}, [persist])

	return { recentSearches, addRecentSearch, clearRecentSearches }
}
