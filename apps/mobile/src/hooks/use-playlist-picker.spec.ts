import { act, renderHook } from '@testing-library/react'
import { usePlaylistPicker } from './use-playlist-picker'

function createMockAddToPlaylist() {
	return {
		mutate: vi.fn(),
		mutateAsync: vi.fn(),
		isPending: false,
		isError: false,
	 isSuccess: false,
		isIdle: true,
		data: undefined,
		error: null,
		reset: vi.fn(),
		context: undefined,
		failureCount: 0,
		failureReason: null,
		isPaused: true,
	 isSuccessError: false,
		submittedAt: 0,
	}
}

describe('usePlaylistPicker', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns initial state', () => {
		const addMusicToPlaylist = createMockAddToPlaylist()
		const { result } = renderHook(() =>
			usePlaylistPicker({ addMusicToPlaylist: addMusicToPlaylist as any }),
		)

		expect(result.current.addingMusicId).toBeNull()
	})

	it('handleAddToPlaylist sets addingMusicId', () => {
		const addMusicToPlaylist = createMockAddToPlaylist()
		const { result } = renderHook(() =>
			usePlaylistPicker({ addMusicToPlaylist: addMusicToPlaylist as any }),
		)

		act(() => {
			result.current.handleAddToPlaylist('music-123')
		})

		expect(result.current.addingMusicId).toBe('music-123')
	})

	it('handleClose clears addingMusicId', () => {
		const addMusicToPlaylist = createMockAddToPlaylist()
		const { result } = renderHook(() =>
			usePlaylistPicker({ addMusicToPlaylist: addMusicToPlaylist as any }),
		)

		act(() => {
			result.current.handleAddToPlaylist('music-123')
		})
		act(() => {
			result.current.handleClose()
		})

		expect(result.current.addingMusicId).toBeNull()
	})

	it('handleSelectPlaylist calls mutate and clears addingMusicId on success', () => {
		const addMusicToPlaylist = createMockAddToPlaylist()
		addMusicToPlaylist.mutate.mockImplementation((_vars: any, options: any) => {
			options.onSuccess()
		})

		const { result } = renderHook(() =>
			usePlaylistPicker({ addMusicToPlaylist: addMusicToPlaylist as any }),
		)

		act(() => {
			result.current.handleAddToPlaylist('music-123')
		})

		act(() => {
			result.current.handleSelectPlaylist('playlist-456')
		})

		expect(addMusicToPlaylist.mutate).toHaveBeenCalledWith(
			{ playlistId: 'playlist-456', musicId: 'music-123' },
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		)
		expect(result.current.addingMusicId).toBeNull()
	})

	it('handleSelectPlaylist does nothing when addingMusicId is null', () => {
		const addMusicToPlaylist = createMockAddToPlaylist()
		const { result } = renderHook(() =>
			usePlaylistPicker({ addMusicToPlaylist: addMusicToPlaylist as any }),
		)

		act(() => {
			result.current.handleSelectPlaylist('playlist-456')
		})

		expect(addMusicToPlaylist.mutate).not.toHaveBeenCalled()
	})
})
