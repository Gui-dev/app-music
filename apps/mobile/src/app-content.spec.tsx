import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react'
import { AppContent } from './app-content'
import * as usePlaylistMutations from './hooks/mutations/use-playlist-mutations'
import * as useMusics from './hooks/queries/use-musics'
import * as usePlaylists from './hooks/queries/use-playlists'

vi.mock('./hooks/queries/use-musics')
vi.mock('./hooks/queries/use-playlists')
vi.mock('./hooks/mutations/use-playlist-mutations')

const mockMusics = [
	{
		id: '1',
		title: 'Song One',
		artist: 'Artist A',
		album: 'Album One',
		duration: 180,
		filePath: '/path/song1.mp3',
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
		filePath: '/path/song2.mp3',
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
		} as ReturnType<typeof useMusics.useMusics>)

		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Biblioteca')
		expect(result.getByText('Loading...')).toBeTruthy()
	})

	it('renders Equalizer presets on Equalizer screen', () => {
		const result = renderWithQuery(<AppContent />)
		clickNav(result, 'Equalizador')
		expect(result.getByText('Presets')).toBeTruthy()
	})
})
