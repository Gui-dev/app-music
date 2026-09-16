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
				try {
					setRecentSearches(JSON.parse(raw))
				} catch {
					AsyncStorage.removeItem(STORAGE_KEY)
				}
			}
		})
	}, [])

	const addRecentSearch = useCallback(async (music: Music) => {
		setRecentSearches((prev) => {
			const filtered = prev.filter((m) => m.id !== music.id)
			const updated = [music, ...filtered].slice(0, MAX_ITEMS)
			AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
			return updated
		})
	}, [])

	const clearRecentSearches = useCallback(() => {
		setRecentSearches([])
		AsyncStorage.setItem(STORAGE_KEY, '[]')
	}, [])

	return { recentSearches, addRecentSearch, clearRecentSearches }
}
