import { fireEvent, render } from '@testing-library/react'
import { MusicCard } from './music-card'

const mockMusic = {
	id: '1',
	title: 'Test Song',
	artist: 'Test Artist',
	album: 'Test Album',
	duration: 180,
	coverUrl: null,
}

describe('MusicCard', () => {
	const onPress = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders music title and artist', () => {
		const { getByText } = render(
			<MusicCard music={mockMusic} onPress={onPress} />,
		)

		expect(getByText('Test Song')).toBeTruthy()
		expect(getByText('Test Artist')).toBeTruthy()
	})

	it('does not render duration by default', () => {
		const { queryByText } = render(
			<MusicCard music={mockMusic} onPress={onPress} />,
		)

		expect(queryByText('3:00')).toBeNull()
	})

	it('renders duration when showDuration is true', () => {
		const { getByText } = render(
			<MusicCard music={mockMusic} onPress={onPress} showDuration />,
		)

		expect(getByText('3:00')).toBeTruthy()
	})

	it('does not render duration when duration is null', () => {
		const musicWithoutDuration = { ...mockMusic, duration: null }
		const { queryByText } = render(
			<MusicCard music={musicWithoutDuration} onPress={onPress} showDuration />,
		)

		expect(queryByText('0:00')).toBeNull()
	})

	it('calls onPress when pressed', () => {
		const { container } = render(
			<MusicCard music={mockMusic} onPress={onPress} />,
		)

		const touchable = container.querySelector('[class*="mx-4"]')
		expect(touchable).toBeTruthy()
		fireEvent.click(touchable!)

		expect(onPress).toHaveBeenCalledTimes(1)
	})

	it('renders musical notes icon', () => {
		const { getByTestId } = render(
			<MusicCard music={mockMusic} onPress={onPress} />,
		)

		const icon = getByTestId('icon-musical-notes')
		expect(icon).toBeTruthy()
	})

	it('applies correct styles via className', () => {
		const { container } = render(
			<MusicCard music={mockMusic} onPress={onPress} />,
		)

		const touchable = container.querySelector('[class*="mx-4"]')
		expect(touchable).toHaveClass('mx-4')
		expect(touchable).toHaveClass('mb-2')
		expect(touchable).toHaveClass('flex-row')
		expect(touchable).toHaveClass('rounded-lg')
		expect(touchable).toHaveClass('bg-surface')
		expect(touchable).toHaveClass('p-3')
	})

	it('formats duration correctly for various values', () => {
		const { getByText: getByText1 } = render(
			<MusicCard
				music={{ ...mockMusic, duration: 60 }}
				onPress={onPress}
				showDuration
			/>,
		)
		expect(getByText1('1:00')).toBeTruthy()

		const { getByText: getByText2 } = render(
			<MusicCard
				music={{ ...mockMusic, duration: 90 }}
				onPress={onPress}
				showDuration
			/>,
		)
		expect(getByText2('1:30')).toBeTruthy()

		const { getByText: getByText3 } = render(
			<MusicCard
				music={{ ...mockMusic, duration: 3661 }}
				onPress={onPress}
				showDuration
			/>,
		)
		expect(getByText3('61:01')).toBeTruthy()
	})
})
