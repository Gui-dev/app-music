import { useQuery } from '@tanstack/react-query'
import { musicApi, type Playlist } from '../../infra/api/music-api'

export function usePlaylists() {
	return useQuery({
		queryKey: ['playlists'],
		queryFn: () => musicApi.listPlaylists(),
		staleTime: 5 * 60 * 1000,
		retry: 1,
	})
}

export function usePlaylist(id: string) {
	return useQuery({
		queryKey: ['playlists', id],
		queryFn: async () => {
			const playlists = await musicApi.listPlaylists()
			return playlists.find((p) => p.id === id)
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	})
}