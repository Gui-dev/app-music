import { useMutation, useQueryClient } from '@tanstack/react-query'
import { musicApi } from '../../infra/api/music-api'

export function useCreatePlaylist() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (name: string) => musicApi.createPlaylist(name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['playlists'] })
		},
	})
}

export function useAddMusicToPlaylist() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			playlistId,
			musicId,
		}: {
			playlistId: string
			musicId: string
		}) => musicApi.addMusicToPlaylist(playlistId, musicId),
		onSuccess: (_, { playlistId }) => {
			queryClient.invalidateQueries({ queryKey: ['playlists'] })
			queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] })
		},
	})
}

export function useRemoveMusicFromPlaylist() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			playlistId,
			musicId,
		}: {
			playlistId: string
			musicId: string
		}) => musicApi.removeMusicFromPlaylist(playlistId, musicId),
		onSuccess: (_, { playlistId }) => {
			queryClient.invalidateQueries({ queryKey: ['playlists'] })
			queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] })
		},
	})
}

export function useScanDirectory() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (path?: string) => musicApi.scanDirectory(path),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['musics'] })
		},
	})
}
