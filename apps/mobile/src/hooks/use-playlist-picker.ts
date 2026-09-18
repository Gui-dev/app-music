import { useCallback, useState } from 'react'
import type { Playlist } from '../infra/api/music-api'
import type { useAddMusicToPlaylist } from './mutations/use-playlist-mutations'

interface UsePlaylistPickerOptions {
	addMusicToPlaylist: ReturnType<typeof useAddMusicToPlaylist>
}

export function usePlaylistPicker({ addMusicToPlaylist }: UsePlaylistPickerOptions) {
	const [addingMusicId, setAddingMusicId] = useState<string | null>(null)

	const handleAddToPlaylist = useCallback((musicId: string) => {
		setAddingMusicId(musicId)
	}, [])

	const handleSelectPlaylist = useCallback(
		(playlistId: string) => {
			if (addingMusicId) {
				addMusicToPlaylist.mutate(
					{ playlistId, musicId: addingMusicId },
					{ onSuccess: () => setAddingMusicId(null) },
				)
			}
		},
		[addingMusicId, addMusicToPlaylist],
	)

	const handleClose = useCallback(() => {
		setAddingMusicId(null)
	}, [])

	return {
		addingMusicId,
		handleAddToPlaylist,
		handleSelectPlaylist,
		handleClose,
	}
}
