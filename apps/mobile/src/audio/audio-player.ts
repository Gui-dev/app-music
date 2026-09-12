import { Audio, type AVPlaybackStatus } from 'expo-av'
import type { Sound } from 'expo-av/build/Audio'

type PlaybackCallback = (status: AVPlaybackStatus) => void

class AudioPlayerService {
	private sound: Sound | null = null
	private callback: PlaybackCallback | null = null

	async load(uri: string): Promise<void> {
		if (this.sound) {
			await this.sound.unloadAsync()
		}

		const { sound } = await Audio.Sound.createAsync(
			{ uri },
			{ shouldPlay: false },
			(status) => {
				this.callback?.(status)
			},
		)

		this.sound = sound
	}

	async play(): Promise<void> {
		if (this.sound) {
			await this.sound.playAsync()
		}
	}

	async pause(): Promise<void> {
		if (this.sound) {
			await this.sound.pauseAsync()
		}
	}

	async seek(positionMillis: number): Promise<void> {
		if (this.sound) {
			await this.sound.setPositionAsync(positionMillis)
		}
	}

	async setRate(rate: number): Promise<void> {
		if (this.sound) {
			await this.sound.setRateAsync(rate, true)
		}
	}

	async getStatus(): Promise<AVPlaybackStatus | null> {
		if (this.sound) {
			return this.sound.getStatusAsync()
		}
		return null
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
