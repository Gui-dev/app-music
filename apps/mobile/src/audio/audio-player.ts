import {
	clearPreloadedSource,
	createAudioPlayer as createPlayer,
	preload,
	type AudioPlayer,
} from 'expo-audio'

type PlaybackCallback = (status: {
	isPlaying: boolean
	positionMillis: number
	durationMillis: number
	isBuffering: boolean
}) => void

class AudioPlayerService {
	private player: AudioPlayer | null = null
	private callback: PlaybackCallback | null = null
	private finishedCallback: (() => void) | null = null
	private errorCallback: ((message: string) => void) | null = null
	private listener: ReturnType<AudioPlayer['addListener']> | null = null

	async load(uri: string): Promise<void> {
		if (this.player) {
			this.removeListener()
			this.player.pause()
			this.player.remove()
		}

		this.player = createPlayer(
			{ uri },
			{ updateInterval: 1000, preferredForwardBufferDuration: 30 },
		)
		this.addListener()
	}

	async play(): Promise<void> {
		this.player?.play()
	}

	async pause(): Promise<void> {
		this.player?.pause()
	}

	async seek(positionMillis: number): Promise<void> {
		if (!this.player) return
		const clamped = Math.max(0, Math.min(positionMillis, (this.player.duration ?? 0) * 1000))
		await this.player.seekTo(clamped / 1000)
	}

	async setRate(rate: number): Promise<void> {
		if (!this.player) return
		this.player.setPlaybackRate(rate)
	}

	async preloadNext(uri: string): Promise<void> {
		try {
			await preload(uri, { preferredForwardBufferDuration: 30 })
		} catch {
			// preload failure is non-critical
		}
	}

	async clearPreload(uri: string): Promise<void> {
		try {
			await clearPreloadedSource(uri)
		} catch {
			// clear failure is non-critical
		}
	}

	onPlaybackStatusUpdate(callback: PlaybackCallback): void {
		this.callback = callback
	}

	onFinished(callback: () => void): void {
		this.finishedCallback = callback
	}

	onError(callback: (message: string) => void): void {
		this.errorCallback = callback
	}

	async unload(): Promise<void> {
		this.removeListener()
		if (this.player) {
			this.player.pause()
			this.player.remove()
			this.player = null
		}
	}

	private addListener(): void {
		if (!this.player) return
		this.listener = this.player.addListener('playbackStatusUpdate', (status) => {
			if (status.isLoaded) {
				this.callback?.({
					isPlaying: status.playing,
					positionMillis: status.currentTime * 1000,
					durationMillis: (status.duration ?? 0) * 1000,
					isBuffering: status.isBuffering,
				})
				if (status.didJustFinish) {
					this.finishedCallback?.()
				}
			} else if (status.error) {
				this.errorCallback?.(status.error)
			}
		})
	}

	private removeListener(): void {
		this.listener?.remove()
		this.listener = null
	}
}

export const audioPlayer = new AudioPlayerService()
