const mockSound = {
	playAsync: vi.fn().mockResolvedValue(undefined),
	pauseAsync: vi.fn().mockResolvedValue(undefined),
	setPositionAsync: vi.fn().mockResolvedValue(undefined),
	setRateAsync: vi.fn().mockResolvedValue(undefined),
	unloadAsync: vi.fn().mockResolvedValue(undefined),
	setOnPlaybackStatusUpdate: vi.fn(),
}

export const Audio = {
	Sound: {
		createAsync: vi.fn().mockResolvedValue({
			sound: mockSound,
			status: { isLoaded: true, isPlaying: false, positionMillis: 0, durationMillis: 0 },
		}),
	},
	setAudioModeAsync: vi.fn().mockResolvedValue(undefined),
}
