import { fireEvent, render, screen } from '@testing-library/react'
import { SearchScreen } from './search-screen'
import type { Music } from '../infra/api/music-api'

const mockMusic: Music = {
	id: '1',
	title: 'Test Song',
	artist: 'Test Artist',
	album: 'Test Album',
	duration: 200,
	coverUrl: null,
	trackNumber: 1,
	year: 2024,
}

const defaultProps = {
	searchQuery: '',
	setSearchQuery: vi.fn(),
	searchResults: { data: [], isLoading: false },
	onSelectMusic: vi.fn(),
	onAddToPlaylist: vi.fn(),
	recentSearches: [] as Music[],
	onAddRecentSearch: vi.fn(),
	onClearRecentSearches: vi.fn(),
}

it('shows recent searches when query is empty', () => {
	render(<SearchScreen {...defaultProps} recentSearches={[mockMusic]} />)

	expect(screen.getByText('Buscas recentes')).toBeTruthy()
	expect(screen.getByText('Test Song')).toBeTruthy()
})

it('hides recent searches when query is not empty', () => {
	render(
		<SearchScreen
			{...defaultProps}
			searchQuery="test"
			recentSearches={[mockMusic]}
		/>,
	)

	expect(screen.queryByText('Buscas recentes')).toBeNull()
})

it('calls onAddRecentSearch when a recent search is tapped', () => {
	render(<SearchScreen {...defaultProps} recentSearches={[mockMusic]} />)

	fireEvent.click(screen.getByText('Test Song'))

	expect(defaultProps.onAddRecentSearch).toHaveBeenCalledWith(mockMusic)
})

it('calls onClearRecentSearches when clear button is pressed', () => {
	render(<SearchScreen {...defaultProps} recentSearches={[mockMusic]} />)

	fireEvent.click(screen.getByText('Limpar'))

	expect(defaultProps.onClearRecentSearches).toHaveBeenCalled()
})

it('hides recent searches section when list is empty and query is empty', () => {
	render(<SearchScreen {...defaultProps} recentSearches={[]} />)

	expect(screen.queryByText('Buscas recentes')).toBeNull()
})
