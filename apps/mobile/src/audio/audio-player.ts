type PlaybackCallback = (status: { isPlaying: boolean; positionMillis: number; durationMillis: number }) => void

class AudioPlayerService {
	private isLoaded = false
	private isPlaying = false
	private positionMillis = 0
	private durationMillis = 0
	private callback: PlaybackCallback | null = null

	async load(_uri: string): Promise<void> {
		this.isLoaded = true
		this.positionMillis = 0
	}

	async play(): Promise<void> {
		this.isPlaying = true
		this.callback?.({
			isPlaying: this.isPlaying,
			positionMillis: this.positionMillis,
			durationMillis: this.durationMillis,
		})
	}

	async pause(): Promise<void> {
		this.isPlaying = false
		this.callback?.({
			isPlaying: this.isPlaying,
			positionMillis: this.positionMillis,
			durationMillis: this.durationMillis,
		})
	}

	async seek(positionMillis: number): Promise<void> {
		this.positionMillis = positionMillis
		this.callback?.({
			isPlaying: this.isPlaying,
			positionMillis: this.positionMillis,
			durationMillis: this.durationMillis,
		})
	}

	async setRate(_rate: number): Promise<void> {}

	onPlaybackStatusUpdate(callback: PlaybackCallback): void {
		this.callback = callback
	}

	async unload(): Promise<void> {
		this.isLoaded = false
		this.isPlaying = false
		this.positionMillis = 0
	}
}

export const audioPlayer = new AudioPlayerService()
