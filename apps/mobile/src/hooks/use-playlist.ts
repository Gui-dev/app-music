import { useCallback, useState } from 'react'
import { type Music, musicApi, type Playlist } from '../infra/api/music-api'

interface PlaylistState {
	playlists: Playlist[]
	isLoading: boolean
	error: string | null
}

export function usePlaylist() {
	const [state, setState] = useState<PlaylistState>({
		playlists: [],
		isLoading: false,
		error: null,
	})

	const fetchPlaylists = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			const playlists = await musicApi.listPlaylists()
			setState((prev) => ({ ...prev, playlists, isLoading: false }))
		} catch (error) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error:
					error instanceof Error ? error.message : 'Failed to fetch playlists',
			}))
		}
	}, [])

	const createPlaylist = useCallback(async (name: string) => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }))
		try {
			const playlist = await musicApi.createPlaylist(name)
			setState((prev) => ({
				...prev,
				playlists: [...prev.playlists, playlist],
				isLoading: false,
			}))
			return playlist
		} catch (error) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error:
					error instanceof Error ? error.message : 'Failed to create playlist',
			}))
			return null
		}
	}, [])

	const addMusicToPlaylist = useCallback(
		async (playlistId: string, musicId: string) => {
			try {
				await musicApi.addMusicToPlaylist(playlistId, musicId)
				await fetchPlaylists()
			} catch (error) {
				setState((prev) => ({
					...prev,
					error:
						error instanceof Error
							? error.message
							: 'Failed to add music to playlist',
				}))
			}
		},
		[fetchPlaylists],
	)

	const removeMusicFromPlaylist = useCallback(
		async (playlistId: string, musicId: string) => {
			try {
				await musicApi.removeMusicFromPlaylist(playlistId, musicId)
				await fetchPlaylists()
			} catch (error) {
				setState((prev) => ({
					...prev,
					error:
						error instanceof Error
							? error.message
							: 'Failed to remove music from playlist',
				}))
			}
		},
		[fetchPlaylists],
	)

	return {
		...state,
		fetchPlaylists,
		createPlaylist,
		addMusicToPlaylist,
		removeMusicFromPlaylist,
	}
}
