import { useCallback, useEffect, useRef, useState } from 'react'
import { audioPlayer } from '../audio/audio-player'
import { type Music, musicApi } from '../infra/api/music-api'

interface PlayerState {
	currentMusic: Music | null
	isPlaying: boolean
	positionMillis: number
	durationMillis: number
	rate: number
	isLoading: boolean
	error: string | null
}

export function usePlayer(playlist?: Music[]) {
	const [state, setState] = useState<PlayerState>({
		currentMusic: null,
		isPlaying: false,
		positionMillis: 0,
		durationMillis: 0,
		rate: 1,
		isLoading: false,
		error: null,
	})

	const playlistRef = useRef(playlist)
	playlistRef.current = playlist

	const setPlaylist = useCallback((list: Music[] | undefined) => {
		playlistRef.current = list
	}, [])

	const finishedRef = useRef<(() => void) | null>(null)

	const setOnFinished = useCallback((cb: () => void) => {
		finishedRef.current = cb
		audioPlayer.onFinished(() => cb())
	}, [])

	useEffect(() => {
		audioPlayer.onPlaybackStatusUpdate((status) => {
			setState((prev) => ({
				...prev,
				isPlaying: status.isPlaying,
				positionMillis: status.positionMillis,
				durationMillis: status.durationMillis,
			}))
		})

		audioPlayer.onError((message) => {
			setState((prev) => ({
				...prev,
				error: message,
				isLoading: false,
			}))
		})

		return () => {
			audioPlayer.unload()
		}
	}, [])

	const prefetchNext = useCallback(async (currentMusic: Music) => {
		const list = playlistRef.current
		if (!list || list.length === 0) return

		const index = list.findIndex((m) => m.id === currentMusic.id)
		if (index === -1 || index >= list.length - 1) return

		const next = list[index + 1]
		const nextUri = musicApi.getStreamUrl(next.id)
		await audioPlayer.preloadNext(nextUri)
	}, [])

	const loadAndPlay = useCallback(
		async (music: Music) => {
			setState((prev) => ({ ...prev, isLoading: true, currentMusic: music, error: null }))

			try {
				const uri = musicApi.getStreamUrl(music.id)
				await audioPlayer.load(uri)
				await audioPlayer.play()
				prefetchNext(music)
			} catch (error) {
				console.error('Error loading music:', error)
				setState((prev) => ({
					...prev,
					error: 'Falha ao carregar música. Verifique a conexão com o servidor.',
					isLoading: false,
				}))
			} finally {
				setState((prev) => ({ ...prev, isLoading: false }))
			}
		},
		[prefetchNext],
	)

	const play = useCallback(async () => {
		await audioPlayer.play()
	}, [])

	const pause = useCallback(async () => {
		await audioPlayer.pause()
	}, [])

	const seek = useCallback(async (positionMillis: number) => {
		await audioPlayer.seek(positionMillis)
	}, [])

	const setRate = useCallback(async (rate: number) => {
		await audioPlayer.setRate(rate)
		setState((prev) => ({ ...prev, rate }))
	}, [])

	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }))
	}, [])

	return {
		...state,
		loadAndPlay,
		play,
		pause,
		seek,
		setRate,
		clearError,
		prefetchNext,
		setPlaylist,
		setOnFinished,
	}
}
