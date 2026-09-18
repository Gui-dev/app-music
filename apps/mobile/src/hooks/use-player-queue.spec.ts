import { act, renderHook } from '@testing-library/react'
import type { Music } from '../infra/api/music-api'
import { usePlayerQueue } from './use-player-queue'

vi.mock('./use-player', () => ({
	usePlayer: vi.fn(),
}))

vi.mock('../audio/audio-player', () => ({}))

const mockMusic: Music = {
	id: '1',
	title: 'Song One',
	artist: 'Artist A',
	album: 'Album One',
	duration: 180000,
	coverUrl: null,
	trackNumber: 1,
	year: 2024,
}

const mockMusic2: Music = {
	...mockMusic,
	id: '2',
	title: 'Song Two',
}

const mockMusic3: Music = {
	...mockMusic,
	id: '3',
	title: 'Song Three',
	album: 'Album Two',
}

function createMockPlayer() {
	return {
		currentMusic: null,
		isPlaying: false,
		positionMillis: 0,
		durationMillis: 180000,
		rate: 1,
		isLoading: false,
		isBuffering: false,
		error: null,
		loadAndPlay: vi.fn(),
		play: vi.fn(),
		pause: vi.fn(),
		seek: vi.fn(),
		setRate: vi.fn(),
		clearError: vi.fn(),
		prefetchNext: vi.fn(),
		setPlaylist: vi.fn(),
		setOnFinished: vi.fn(),
	}
}

describe('usePlayerQueue', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns initial state', () => {
		const player = createMockPlayer()
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic, mockMusic2] }),
		)

		expect(result.current.selectedMusic).toBeNull()
		expect(result.current.progress).toBe(0)
		expect(result.current.albumGroups).toHaveLength(1)
	})

	it('selectAndPlay sets selectedMusic and calls loadAndPlay', () => {
		const player = createMockPlayer()
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic] }),
		)

		act(() => {
			result.current.selectAndPlay(mockMusic)
		})

		expect(result.current.selectedMusic).toEqual(mockMusic)
		expect(player.loadAndPlay).toHaveBeenCalledWith(mockMusic)
	})

	it('goNext advances to next song', () => {
		const player = createMockPlayer()
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic, mockMusic2] }),
		)

		act(() => {
			result.current.selectAndPlay(mockMusic)
		})

		act(() => {
			result.current.goNext()
		})

		expect(result.current.selectedMusic?.id).toBe('2')
		expect(player.loadAndPlay).toHaveBeenCalledWith(mockMusic2)
	})

	it('goNext wraps around to first song', () => {
		const player = createMockPlayer()
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic, mockMusic2] }),
		)

		act(() => {
			result.current.selectAndPlay(mockMusic2)
		})

		act(() => {
			result.current.goNext()
		})

		expect(result.current.selectedMusic?.id).toBe('1')
	})

	it('goPrev goes to previous song', () => {
		const player = createMockPlayer()
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic, mockMusic2] }),
		)

		act(() => {
			result.current.selectAndPlay(mockMusic2)
		})

		act(() => {
			result.current.goPrev()
		})

		expect(result.current.selectedMusic?.id).toBe('1')
	})

	it('goPrev wraps around to last song', () => {
		const player = createMockPlayer()
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic, mockMusic2] }),
		)

		act(() => {
			result.current.selectAndPlay(mockMusic)
		})

		act(() => {
			result.current.goPrev()
		})

		expect(result.current.selectedMusic?.id).toBe('2')
	})

	it('goNext/prev does nothing when no music selected', () => {
		const player = createMockPlayer()
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic] }),
		)

		act(() => {
			result.current.goNext()
		})
		act(() => {
			result.current.goPrev()
		})

		expect(result.current.selectedMusic).toBeNull()
		expect(player.loadAndPlay).not.toHaveBeenCalled()
	})

	it('handleSeek calls player.seek with position', () => {
		const player = createMockPlayer()
		player.durationMillis = 100000
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic] }),
		)

		act(() => {
			result.current.handleSeek(0.5)
		})

		expect(player.seek).toHaveBeenCalledWith(50000)
	})

	it('progress calculates correctly', () => {
		const player = createMockPlayer()
		player.positionMillis = 30000
		player.durationMillis = 120000
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic] }),
		)

		expect(result.current.progress).toBeCloseTo(0.25)
	})

	it('groups songs by album', () => {
		const player = createMockPlayer()
		const { result } = renderHook(() =>
			usePlayerQueue({ player, musics: [mockMusic, mockMusic2, mockMusic3] }),
		)

		expect(result.current.albumGroups).toHaveLength(2)
	})

	it('uses playlist musics for goNext when selectedPlaylistMusicIds provided', () => {
		const player = createMockPlayer()
		const { result } = renderHook(() =>
			usePlayerQueue({
				player,
				musics: [mockMusic, mockMusic2, mockMusic3],
				selectedPlaylistMusicIds: ['1', '3'],
			}),
		)

		act(() => {
			result.current.selectAndPlay(mockMusic)
		})

		act(() => {
			result.current.goNext()
		})

		expect(result.current.selectedMusic?.id).toBe('3')
	})
})
