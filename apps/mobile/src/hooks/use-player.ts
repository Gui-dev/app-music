import { useCallback, useEffect, useState } from 'react'
import { audioPlayer } from '../audio/audio-player'
import { type Music, musicApi } from '../infra/api/music-api'

interface PlayerState {
	currentMusic: Music | null
	isPlaying: boolean
	positionMillis: number
	durationMillis: number
	rate: number
	isLoading: boolean
}

export function usePlayer() {
	const [state, setState] = useState<PlayerState>({
		currentMusic: null,
		isPlaying: false,
		positionMillis: 0,
		durationMillis: 0,
		rate: 1,
		isLoading: false,
	})

	useEffect(() => {
		audioPlayer.onPlaybackStatusUpdate((status) => {
			setState((prev) => ({
				...prev,
				isPlaying: status.isPlaying,
				positionMillis: status.positionMillis,
				durationMillis: status.durationMillis,
			}))
		})

		return () => {
			audioPlayer.unload()
		}
	}, [])

	const loadAndPlay = useCallback(async (music: Music) => {
		setState((prev) => ({ ...prev, isLoading: true, currentMusic: music }))

		try {
			const uri = musicApi.getStreamUrl(music.id)
			await audioPlayer.load(uri)
			await audioPlayer.play()
		} catch (error) {
			console.error('Error loading music:', error)
		} finally {
			setState((prev) => ({ ...prev, isLoading: false }))
		}
	}, [])

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

	return {
		...state,
		loadAndPlay,
		play,
		pause,
		seek,
		setRate,
	}
}
