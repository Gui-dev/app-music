import { fireEvent, render } from '@testing-library/react'
import type { Music } from '../../infra/api/music-api'
import { AlbumCard } from './album-card'

const mockSongs: Music[] = [
	{
		id: '1',
		title: 'Song One',
		artist: 'Artist A',
		album: 'Test Album',
		duration: 180000,
		filePath: '/path/song1.mp3',
		coverUrl: null,
		trackNumber: 1,
		year: 2024,
	},
	{
		id: '2',
		title: 'Song Two',
		artist: 'Artist B',
		album: 'Test Album',
		duration: 240000,
		filePath: '/path/song2.mp3',
		coverUrl: null,
		trackNumber: 2,
		year: 2024,
	},
]

const defaultProps = {
	albumName: 'Test Album',
	songs: mockSongs,
	isExpanded: false,
	onToggle: vi.fn(),
	onSongPress: vi.fn(),
}

describe('AlbumCard', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders album name', () => {
		const { getByText } = render(<AlbumCard {...defaultProps} />)

		expect(getByText('Test Album')).toBeTruthy()
	})

	it('renders song count', () => {
		const { getByText } = render(<AlbumCard {...defaultProps} />)

		expect(getByText('2 faixas')).toBeTruthy()
	})

	it('renders singular label for one song', () => {
		const { getByText } = render(
			<AlbumCard {...defaultProps} songs={[mockSongs[0]]} />,
		)

		expect(getByText('1 faixas')).toBeTruthy()
	})

	it('shows chevron-down when collapsed', () => {
		const { getByTestId } = render(
			<AlbumCard {...defaultProps} isExpanded={false} />,
		)

		expect(getByTestId('icon-chevron-down')).toBeTruthy()
	})

	it('shows chevron-up when expanded', () => {
		const { getByTestId } = render(
			<AlbumCard {...defaultProps} isExpanded={true} />,
		)

		expect(getByTestId('icon-chevron-up')).toBeTruthy()
	})

	it('calls onToggle when header pressed', () => {
		const { container } = render(<AlbumCard {...defaultProps} />)

		const header = container.querySelector('[class*="mb-3"]')
		fireEvent.click(header!)
		expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
	})

	it('does not render songs when collapsed', () => {
		const { queryByText } = render(
			<AlbumCard {...defaultProps} isExpanded={false} />,
		)

		expect(queryByText('Song One')).toBeNull()
		expect(queryByText('Song Two')).toBeNull()
	})

	it('renders songs when expanded', () => {
		const { getByText } = render(
			<AlbumCard {...defaultProps} isExpanded={true} />,
		)

		expect(getByText('Song One')).toBeTruthy()
		expect(getByText('Song Two')).toBeTruthy()
	})

	it('renders song artists when expanded', () => {
		const { getByText } = render(
			<AlbumCard {...defaultProps} isExpanded={true} />,
		)

		expect(getByText('Artist A')).toBeTruthy()
		expect(getByText('Artist B')).toBeTruthy()
	})

	it('calls onSongPress with correct song when pressed', () => {
		const { getByText } = render(
			<AlbumCard {...defaultProps} isExpanded={true} />,
		)

		const songCard = getByText('Song One').closest('[class*="mx-4"]')
		fireEvent.click(songCard!)
		expect(defaultProps.onSongPress).toHaveBeenCalledWith(mockSongs[0])
	})

	it('renders musical-notes icon in album placeholder', () => {
		const { getByTestId } = render(<AlbumCard {...defaultProps} />)

		expect(getByTestId('icon-musical-notes')).toBeTruthy()
	})

	it('applies correct container styles', () => {
		const { container } = render(<AlbumCard {...defaultProps} />)

		const wrapper = container.firstChild as HTMLElement
		expect(wrapper).toHaveClass('mx-4')
		expect(wrapper).toHaveClass('mb-4')
	})

	it('applies album placeholder styles', () => {
		const { container } = render(<AlbumCard {...defaultProps} />)

		const placeholder = container.querySelector(
			'[class*="h-16"][class*="w-16"]',
		)
		expect(placeholder).toBeTruthy()
		expect(placeholder).toHaveClass('rounded-lg')
		expect(placeholder).toHaveClass('bg-surface-hover')
	})

	it('renders album name with bold text', () => {
		const { container } = render(<AlbumCard {...defaultProps} />)

		const albumText = container.querySelector(
			'[class*="font-bold"][class*="text-lg"]',
		)
		expect(albumText).toBeTruthy()
		expect(albumText).toHaveClass('text-text-primary')
	})

	it('renders song count with secondary text', () => {
		const { container } = render(<AlbumCard {...defaultProps} />)

		const countText = container.querySelector(
			'[class*="text-sm"][class*="text-text-secondary"]',
		)
		expect(countText).toBeTruthy()
	})

	it('renders empty song list when expanded with no songs', () => {
		const { getByText } = render(
			<AlbumCard {...defaultProps} isExpanded={true} songs={[]} />,
		)

		expect(getByText('0 faixas')).toBeTruthy()
	})
})
