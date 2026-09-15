import { act, renderHook } from '@testing-library/react'
import type { Playlist } from '../infra/api/music-api'
import { musicApi } from '../infra/api/music-api'
import { usePlaylist } from './use-playlist'

vi.mock('../infra/api/music-api', () => ({
	musicApi: {
		listPlaylists: vi.fn(),
		createPlaylist: vi.fn(),
		addMusicToPlaylist: vi.fn().mockResolvedValue(undefined),
		removeMusicFromPlaylist: vi.fn().mockResolvedValue(undefined),
	},
}))

const mockPlaylists: Playlist[] = [
	{
		id: '1',
		name: 'My Playlist',
		musicIds: ['m1', 'm2'],
		createdAt: '2024-01-01',
		updatedAt: '2024-01-01',
	},
	{
		id: '2',
		name: 'Workout Mix',
		musicIds: ['m3'],
		createdAt: '2024-01-02',
		updatedAt: '2024-01-02',
	},
]

describe('usePlaylist', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns initial state', () => {
		const { result } = renderHook(() => usePlaylist())

		expect(result.current.playlists).toEqual([])
		expect(result.current.isLoading).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it('fetchPlaylists loads playlists successfully', async () => {
		vi.mocked(musicApi.listPlaylists).mockResolvedValue(mockPlaylists)

		const { result } = renderHook(() => usePlaylist())

		await act(async () => {
			await result.current.fetchPlaylists()
		})

		expect(result.current.playlists).toEqual(mockPlaylists)
		expect(result.current.isLoading).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it('fetchPlaylists sets error on failure', async () => {
		vi.mocked(musicApi.listPlaylists).mockRejectedValue(
			new Error('Network error'),
		)

		const { result } = renderHook(() => usePlaylist())

		await act(async () => {
			await result.current.fetchPlaylists()
		})

		expect(result.current.playlists).toEqual([])
		expect(result.current.isLoading).toBe(false)
		expect(result.current.error).toBe('Network error')
	})

	it('fetchPlaylists sets generic error for non-Error throw', async () => {
		vi.mocked(musicApi.listPlaylists).mockRejectedValue('unknown')

		const { result } = renderHook(() => usePlaylist())

		await act(async () => {
			await result.current.fetchPlaylists()
		})

		expect(result.current.error).toBe('Failed to fetch playlists')
	})

	it('createPlaylist adds playlist to state', async () => {
		const newPlaylist: Playlist = {
			id: '3',
			name: 'New Playlist',
			musicIds: [],
			createdAt: '2024-01-03',
			updatedAt: '2024-01-03',
		}
		vi.mocked(musicApi.createPlaylist).mockResolvedValue(newPlaylist)

		const { result } = renderHook(() => usePlaylist())

		let returned: Playlist | null = null
		await act(async () => {
			returned = await result.current.createPlaylist('New Playlist')
		})

		expect(returned).toEqual(newPlaylist)
		expect(result.current.playlists).toEqual([newPlaylist])
		expect(result.current.isLoading).toBe(false)
	})

	it('createPlaylist calls musicApi.createPlaylist with name', async () => {
		vi.mocked(musicApi.createPlaylist).mockResolvedValue({
			id: '3',
			name: 'Test',
			musicIds: [],
			createdAt: '',
			updatedAt: '',
		})

		const { result } = renderHook(() => usePlaylist())

		await act(async () => {
			await result.current.createPlaylist('Test')
		})

		expect(musicApi.createPlaylist).toHaveBeenCalledWith('Test')
	})

	it('createPlaylist returns null on error', async () => {
		vi.mocked(musicApi.createPlaylist).mockRejectedValue(
			new Error('Create failed'),
		)

		const { result } = renderHook(() => usePlaylist())

		let returned: Playlist | null = null
		await act(async () => {
			returned = await result.current.createPlaylist('Fail')
		})

		expect(returned).toBeNull()
		expect(result.current.error).toBe('Create failed')
	})

	it('addMusicToPlaylist calls API and refetches', async () => {
		vi.mocked(musicApi.listPlaylists).mockResolvedValue(mockPlaylists)

		const { result } = renderHook(() => usePlaylist())

		await act(async () => {
			await result.current.addMusicToPlaylist('1', 'm1')
		})

		expect(musicApi.addMusicToPlaylist).toHaveBeenCalledWith('1', 'm1')
		expect(musicApi.listPlaylists).toHaveBeenCalled()
	})

	it('addMusicToPlaylist sets error on failure', async () => {
		vi.mocked(musicApi.addMusicToPlaylist).mockRejectedValue(
			new Error('Add failed'),
		)

		const { result } = renderHook(() => usePlaylist())

		await act(async () => {
			await result.current.addMusicToPlaylist('1', 'm1')
		})

		expect(result.current.error).toBe('Add failed')
	})

	it('removeMusicFromPlaylist calls API and refetches', async () => {
		vi.mocked(musicApi.listPlaylists).mockResolvedValue(mockPlaylists)

		const { result } = renderHook(() => usePlaylist())

		await act(async () => {
			await result.current.removeMusicFromPlaylist('1', 'm1')
		})

		expect(musicApi.removeMusicFromPlaylist).toHaveBeenCalledWith('1', 'm1')
		expect(musicApi.listPlaylists).toHaveBeenCalled()
	})

	it('removeMusicFromPlaylist sets error on failure', async () => {
		vi.mocked(musicApi.removeMusicFromPlaylist).mockRejectedValue(
			new Error('Remove failed'),
		)

		const { result } = renderHook(() => usePlaylist())

		await act(async () => {
			await result.current.removeMusicFromPlaylist('1', 'm1')
		})

		expect(result.current.error).toBe('Remove failed')
	})
})
