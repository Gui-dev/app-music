import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react'
import { AppContent } from './app-content'
import * as usePlayer from './hooks/use-player'
import * as usePlaylistMutations from './hooks/mutations/use-playlist-mutations'
import * as useMusics from './hooks/queries/use-musics'
import * as usePlaylists from './hooks/queries/use-playlists'

vi.mock('./hooks/queries/use-musics')
vi.mock('./hooks/queries/use-playlists')
vi.mock('./hooks/mutations/use-playlist-mutations')
vi.mock('./hooks/use-player')
vi.mock('./audio/audio-player')

const mockMusics = [
	{
		id: '1',
		title: 'Song One',
		artist: 'Artist A',
		album: 'Album One',
		duration: 180,
		coverUrl: null,
		trackNumber: 1,
		year: 2024,
	},
	{
		id: '2',
		title: 'Song Two',
		artist: 'Artist B',
		album: 'Album One',
		duration: 240,
		coverUrl: null,
		trackNumber: 2,
		year: 2024,
	},
]

const mockPlaylists = [
	{
		id: '1',
		name: 'My Playlist',
		musicIds: ['1'],
		createdAt: '2024-01-01',
		updatedAt: '2024-01-01',
	},
]

function createQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
}

function renderWithQuery(ui: React.ReactElement) {
	return render(
		<QueryClientProvider client={createQueryClient()}>
			{ui}
		</QueryClientProvider>,
	)
}

function clickNav(result: ReturnType<typeof renderWithQuery>, label: string) {
	fireEvent.click(result.getByRole('button', { name: new RegExp(label) }))
}

describe('AppContent', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(useMusics.useMusics).mockReturnValue({
			data: mockMusics,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			isRefetching: false,
		} as unknown as ReturnType<typeof useMusics.useMusics>)
		vi.mocked(useMusics.useSearchMusics).mockReturnValue({
			data: [],
			isLoading: false,
		} as unknown as ReturnType<typeof useMusics.useSearchMusics>)
		vi.mocked(usePlaylists.usePlaylists).mockReturnValue({
			data: mockPlaylists,
			isLoading: false,
		} as unknown as ReturnType<typeof usePlaylists.usePlaylists>)
		vi.mocked(usePlaylistMutations.useCreatePlaylist).mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue(mockPlaylists[0]),
		} as unknown as ReturnType<typeof usePlaylistMutations.useCreatePlaylist>)
		vi.mocked(usePlaylistMutations.useAddMusicToPlaylist).mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue(undefined),
		} as unknown as ReturnType<typeof usePlaylistMutations.useAddMusicToPlaylist>)
		vi.mocked(usePlaylistMutations.useRemoveMusicFromPlaylist).mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue(undefined),
		} as unknown as ReturnType<typeof usePlaylistMutations.useRemoveMusicFromPlaylist>)
		vi.mocked(usePlayer.usePlayer).mockReturnValue({
			currentMusic: null,
			isPlaying: false,
			positionMillis: 0,
			durationMillis: 0,
			rate: 1,
			isLoading: false,
			loadAndPlay: vi.fn(),
			play: vi.fn(),
			pause: vi.fn(),
			seek: vi.fn(),
			setRate: vi.fn(),
			prefetchNext: vi.fn(),
			setPlaylist: vi.fn(),
		} as unknown as ReturnType<typeof usePlayer.usePlayer>)
	})

	it('renders Player screen by default', () => {
		const result = renderWithQuery(<AppContent />)
		expect(result.getByText('No music selected')).toBeTruthy()
	})

	it('renders BottomNav with all tabs', () => {
		const result = renderWithQuery(<AppContent />)

		expect(result.getByRole('button', { name: /Player/ })).toBeTruthy()
		expect(result.getByRole('button', { name: /Search/ })).toBeTruthy()
		expect(result.getByRole('button', { name: /Biblioteca/ })).toBeTruthy()
		expect(result.getByRole('button', { name: /Playlists/ })).toBeTruthy()
		expect(result.getByRole('button', { name: /Equalizador/ })).toBeTruthy()
	})

	it('navigates to Search screen and shows search input', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Search')
		expect(result.getByPlaceholderText('Search music...')).toBeTruthy()
	})

	it('navigates to Biblioteca screen and shows header', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Biblioteca')
		const headers = result.getAllByText('Biblioteca')
		expect(headers.length).toBeGreaterThanOrEqual(2)
	})

	it('navigates to Equalizer screen and shows Equalizer content', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Equalizador')
		expect(result.getByText('FLAT')).toBeTruthy()
	})

	it('shows music count in Biblioteca header', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Biblioteca')
		const countText = result.container.querySelector(
			'[class*="text-sm"][class*="text-text-secondary"]',
		)
		expect(countText).toBeTruthy()
		expect(countText?.textContent).toContain('2')
		expect(countText?.textContent).toContain('faixas')
	})

	it('shows albums in Biblioteca', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Biblioteca')
		expect(result.getByText('Album One')).toBeTruthy()
	})

	it('expands album when pressed', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Biblioteca')
		fireEvent.click(result.getByText('Album One'))
		expect(result.getByText('Song One')).toBeTruthy()
		expect(result.getByText('Song Two')).toBeTruthy()
	})

	it('shows no music message when list is empty', () => {
		vi.mocked(useMusics.useMusics).mockReturnValue({
			data: [],
			isLoading: false,
			error: null,
			refetch: vi.fn(),
			isRefetching: false,
		} as unknown as ReturnType<typeof useMusics.useMusics>)

		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Biblioteca')
		expect(result.getByText('No music found')).toBeTruthy()
	})

	it('shows loading state', () => {
		vi.mocked(useMusics.useMusics).mockReturnValue({
			data: undefined,
			isLoading: true,
			error: null,
			refetch: vi.fn(),
			isRefetching: false,
		} as unknown as ReturnType<typeof useMusics.useMusics>)

		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Biblioteca')
		expect(result.getByText('Loading...')).toBeTruthy()
	})

	it('renders Equalizer presets on Equalizer screen', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Equalizador')
		expect(result.getByText('Presets')).toBeTruthy()
	})

	it('navigates to Playlists screen and shows header', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Playlists')
		const headers = result.getAllByText('Playlists')
		expect(headers.length).toBeGreaterThanOrEqual(2)
	})

	it('shows playlist count in header', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Playlists')
		expect(result.getByText('1 playlists')).toBeTruthy()
	})

	it('shows playlist name and song count', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Playlists')
		expect(result.getByText('My Playlist')).toBeTruthy()
		expect(result.getByText('1 songs')).toBeTruthy()
	})

	it('shows create playlist input and button', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Playlists')
		expect(result.getByPlaceholderText('New playlist name...')).toBeTruthy()
		expect(result.getByText('Create')).toBeTruthy()
	})

	it('shows empty state when no playlists', () => {
		vi.mocked(usePlaylists.usePlaylists).mockReturnValue({
			data: [],
			isLoading: false,
		} as unknown as ReturnType<typeof usePlaylists.usePlaylists>)

		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Playlists')
		expect(result.getByText('No playlists yet')).toBeTruthy()
	})

	it('navigates to playlist detail when playlist pressed', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Playlists')
		fireEvent.click(result.getByText('My Playlist'))
		expect(result.getByText('← Back to playlists')).toBeTruthy()
		expect(result.getByText('1 songs')).toBeTruthy()
	})

	it('returns to playlists list when back pressed', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Playlists')
		fireEvent.click(result.getByText('My Playlist'))
		fireEvent.click(result.getByText('← Back to playlists'))
		expect(result.getByText('My Playlist')).toBeTruthy()
	})
})
