import { Audio } from 'expo-av'

type PlaybackCallback = (status: {
	isPlaying: boolean
	positionMillis: number
	durationMillis: number
}) => void

class AudioPlayerService {
	private sound: Audio.Sound | null = null
	private callback: PlaybackCallback | null = null

	async load(uri: string): Promise<void> {
		if (this.sound) {
			await this.sound.unloadAsync()
		}

		const { sound } = await Audio.Sound.createAsync(
			{ uri },
			{ shouldPlay: false },
			(status) => {
				if (status.isLoaded) {
					this.callback?.({
						isPlaying: status.isPlaying,
						positionMillis: status.positionMillis,
						durationMillis: status.durationMillis ?? 0,
					})
				}
			},
		)

		this.sound = sound
	}

	async play(): Promise<void> {
		if (!this.sound) return
		await this.sound.playAsync()
	}

	async pause(): Promise<void> {
		if (!this.sound) return
		await this.sound.pauseAsync()
	}

	async seek(positionMillis: number): Promise<void> {
		if (!this.sound) return
		await this.sound.setPositionAsync(positionMillis)
	}

	async setRate(rate: number): Promise<void> {
		if (!this.sound) return
		await this.sound.setRateAsync(rate, true)
	}

	onPlaybackStatusUpdate(callback: PlaybackCallback): void {
		this.callback = callback
	}

	async unload(): Promise<void> {
		if (this.sound) {
			await this.sound.unloadAsync()
			this.sound = null
		}
	}
}

export const audioPlayer = new AudioPlayerService()
