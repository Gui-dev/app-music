import { act, renderHook } from '@testing-library/react'
import { audioPlayer } from '../audio/audio-player'
import type { Music } from '../infra/api/music-api'
import { musicApi } from '../infra/api/music-api'
import { usePlayer } from './use-player'

vi.mock('../audio/audio-player', () => ({
	audioPlayer: {
		load: vi.fn().mockResolvedValue(undefined),
		play: vi.fn().mockResolvedValue(undefined),
		pause: vi.fn().mockResolvedValue(undefined),
		seek: vi.fn().mockResolvedValue(undefined),
		setRate: vi.fn().mockResolvedValue(undefined),
		unload: vi.fn().mockResolvedValue(undefined),
		onPlaybackStatusUpdate: vi.fn(),
		onFinished: vi.fn(),
	},
}))

vi.mock('../infra/api/music-api', () => ({
	musicApi: {
		getStreamUrl: vi.fn().mockReturnValue('http://localhost:3000/stream/1'),
	},
}))

const mockMusic: Music = {
	id: '1',
	title: 'Test Song',
	artist: 'Test Artist',
	album: 'Test Album',
	duration: 180000,
	coverUrl: null,
	trackNumber: 1,
	year: 2024,
}

describe('usePlayer', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns initial state', () => {
		const { result } = renderHook(() => usePlayer())

		expect(result.current.currentMusic).toBeNull()
		expect(result.current.isPlaying).toBe(false)
		expect(result.current.positionMillis).toBe(0)
		expect(result.current.durationMillis).toBe(0)
		expect(result.current.rate).toBe(1)
		expect(result.current.isLoading).toBe(false)
	})

	it('registers playback status update listener on mount', () => {
		renderHook(() => usePlayer())

		expect(audioPlayer.onPlaybackStatusUpdate).toHaveBeenCalledTimes(1)
		expect(audioPlayer.onPlaybackStatusUpdate).toHaveBeenCalledWith(
			expect.any(Function),
		)
	})

	it('cleans up on unmount', () => {
		const { unmount } = renderHook(() => usePlayer())

		unmount()

		expect(audioPlayer.unload).toHaveBeenCalledTimes(1)
	})

	it('updates state from playback status callback', () => {
		const { result } = renderHook(() => usePlayer())

		const callback = vi.mocked(audioPlayer.onPlaybackStatusUpdate).mock
			.calls[0][0]

		act(() => {
			callback({
				isPlaying: true,
				positionMillis: 5000,
				durationMillis: 180000,
			})
		})

		expect(result.current.isPlaying).toBe(true)
		expect(result.current.positionMillis).toBe(5000)
		expect(result.current.durationMillis).toBe(180000)
	})

	it('loadAndPlay sets isLoading and currentMusic', async () => {
		const { result } = renderHook(() => usePlayer())

		await act(async () => {
			await result.current.loadAndPlay(mockMusic)
		})

		expect(result.current.currentMusic).toEqual(mockMusic)
		expect(result.current.isLoading).toBe(false)
	})

	it('loadAndPlay calls audioPlayer.load with stream url', async () => {
		const { result } = renderHook(() => usePlayer())

		await act(async () => {
			await result.current.loadAndPlay(mockMusic)
		})

		expect(musicApi.getStreamUrl).toHaveBeenCalledWith('1')
		expect(audioPlayer.load).toHaveBeenCalledWith(
			'http://localhost:3000/stream/1',
		)
	})

	it('loadAndPlay calls audioPlayer.play after load', async () => {
		const { result } = renderHook(() => usePlayer())

		await act(async () => {
			await result.current.loadAndPlay(mockMusic)
		})

		expect(audioPlayer.play).toHaveBeenCalledTimes(1)
	})

	it('loadAndPlay sets isLoading to false on error', async () => {
		vi.mocked(audioPlayer.load).mockRejectedValueOnce(new Error('load failed'))

		const { result } = renderHook(() => usePlayer())

		await act(async () => {
			await result.current.loadAndPlay(mockMusic)
		})

		expect(result.current.isLoading).toBe(false)
	})

	it('play calls audioPlayer.play', async () => {
		const { result } = renderHook(() => usePlayer())

		await act(async () => {
			await result.current.play()
		})

		expect(audioPlayer.play).toHaveBeenCalledTimes(1)
	})

	it('pause calls audioPlayer.pause', async () => {
		const { result } = renderHook(() => usePlayer())

		await act(async () => {
			await result.current.pause()
		})

		expect(audioPlayer.pause).toHaveBeenCalledTimes(1)
	})

	it('seek calls audioPlayer.seek with position', async () => {
		const { result } = renderHook(() => usePlayer())

		await act(async () => {
			await result.current.seek(5000)
		})

		expect(audioPlayer.seek).toHaveBeenCalledWith(5000)
	})

	it('setRate calls audioPlayer.setRate and updates state', async () => {
		const { result } = renderHook(() => usePlayer())

		await act(async () => {
			await result.current.setRate(1.5)
		})

		expect(audioPlayer.setRate).toHaveBeenCalledWith(1.5)
		expect(result.current.rate).toBe(1.5)
	})
})
