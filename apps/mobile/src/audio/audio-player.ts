import { createAudioPlayer as createPlayer, type AudioPlayer } from 'expo-audio'

type PlaybackCallback = (status: {
	isPlaying: boolean
	positionMillis: number
	durationMillis: number
}) => void

class AudioPlayerService {
	private player: AudioPlayer | null = null
	private callback: PlaybackCallback | null = null
	private listener: ReturnType<AudioPlayer['addListener']> | null = null

	async load(uri: string): Promise<void> {
		if (this.player) {
			this.removeListener()
			this.player.remove()
		}

		this.player = createPlayer({ uri }, { updateInterval: 200 })
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
		await this.player.seekTo(positionMillis / 1000)
	}

	async setRate(rate: number): Promise<void> {
		if (!this.player) return
		this.player.setPlaybackRate(rate)
	}

	onPlaybackStatusUpdate(callback: PlaybackCallback): void {
		this.callback = callback
	}

	async unload(): Promise<void> {
		this.removeListener()
		if (this.player) {
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
				})
			}
		})
	}

	private removeListener(): void {
		this.listener?.remove()
		this.listener = null
	}
}

export const audioPlayer = new AudioPlayerService()
