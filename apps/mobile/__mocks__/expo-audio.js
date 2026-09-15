const mockPlayer = {
	play: vi.fn(),
	pause: vi.fn(),
	seekTo: vi.fn().mockResolvedValue(undefined),
	setPlaybackRate: vi.fn(),
	remove: vi.fn(),
	replace: vi.fn(),
	addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
	playing: false,
	isLoaded: false,
	currentTime: 0,
	duration: 0,
}

module.exports = {
	createAudioPlayer: vi.fn().mockReturnValue(mockPlayer),
	useAudioPlayer: vi.fn().mockReturnValue(mockPlayer),
	useAudioPlayerStatus: vi.fn().mockReturnValue({
		playing: false,
		currentTime: 0,
		duration: 0,
		isLoaded: false,
	}),
	setAudioModeAsync: vi.fn().mockResolvedValue(undefined),
	setIsAudioActiveAsync: vi.fn().mockResolvedValue(undefined),
}
