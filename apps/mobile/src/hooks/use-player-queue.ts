import { useCallback, useEffect, useRef, useState } from 'react'
import type { Music } from '../infra/api/music-api'
import type { usePlayer } from './use-player'

interface UsePlayerQueueOptions {
	player: ReturnType<typeof usePlayer>
	musics: Music[]
	selectedPlaylistMusicIds?: string[]
}

export function usePlayerQueue({ player, musics, selectedPlaylistMusicIds }: UsePlayerQueueOptions) {
	const [selectedMusic, setSelectedMusic] = useState<Music | null>(null)
	const lastPlayedIdRef = useRef<string | null>(null)

	const musicList = musics || []

	const groupByAlbum = (songs: Music[]) => {
		const albums = songs.reduce(
			(acc, song) => {
				const albumKey = song.album || 'Unknown Album'
				if (!acc[albumKey]) {
					acc[albumKey] = []
				}
				acc[albumKey].push(song)
				return acc
			},
			{} as Record<string, Music[]>,
		)
		return Object.entries(albums).sort(([a], [b]) => a.localeCompare(b))
	}

	const albumGroups = groupByAlbum(musicList)

	const progress =
		player.durationMillis > 0
			? player.positionMillis / player.durationMillis
			: 0

	const activePlaylistMusics: Music[] | undefined = selectedPlaylistMusicIds
		? musicList.filter((m) => selectedPlaylistMusicIds.includes(m.id))
		: undefined

	const selectAndPlay = useCallback(
		(music: Music) => {
			setSelectedMusic(music)
			lastPlayedIdRef.current = music.id
			player.loadAndPlay(music)
		},
		[player],
	)

	const goNext = useCallback(() => {
		if (!selectedMusic) return
		const list = (activePlaylistMusics && activePlaylistMusics.length > 0) ? activePlaylistMusics : musicList
		const index = list.findIndex((m) => m.id === selectedMusic.id)
		const next = list[(index + 1) % list.length]
		selectAndPlay(next)
	}, [selectedMusic, activePlaylistMusics, musicList, selectAndPlay])

	const goPrev = useCallback(() => {
		if (!selectedMusic) return
		const list = (activePlaylistMusics && activePlaylistMusics.length > 0) ? activePlaylistMusics : musicList
		const index = list.findIndex((m) => m.id === selectedMusic.id)
		const prev = list[(index - 1 + list.length) % list.length]
		selectAndPlay(prev)
	}, [selectedMusic, activePlaylistMusics, musicList, selectAndPlay])

	const handleSeek = useCallback(
		(value: number) => {
			const positionMillis = value * player.durationMillis
			player.seek(positionMillis)
		},
		[player],
	)

	useEffect(() => {
		player.setOnFinished(goNext)
	}, [player, goNext])

	useEffect(() => {
		player.setPlaylist(activePlaylistMusics)
	}, [activePlaylistMusics, player])

	return {
		selectedMusic,
		selectAndPlay,
		goNext,
		goPrev,
		progress,
		handleSeek,
		albumGroups,
	}
}
