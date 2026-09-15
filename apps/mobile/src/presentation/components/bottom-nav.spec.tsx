import { fireEvent, render } from '@testing-library/react'
import { BottomNav } from './bottom-nav'

describe('BottomNav', () => {
	const setScreen = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders all tab labels', () => {
		const { getByText } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		expect(getByText('Player')).toBeTruthy()
		expect(getByText('Search')).toBeTruthy()
		expect(getByText('Biblioteca')).toBeTruthy()
		expect(getByText('Equalizador')).toBeTruthy()
	})

	it('shows solid icon for active Player tab', () => {
		const { getByTestId } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		expect(getByTestId('icon-musical-notes')).toBeTruthy()
	})

	it('shows outline icon for inactive Player tab', () => {
		const { getByTestId } = render(
			<BottomNav screen="Search" setScreen={setScreen} />,
		)

		expect(getByTestId('icon-musical-notes-outline')).toBeTruthy()
	})

	it('shows solid icon for active Search tab', () => {
		const { getByTestId } = render(
			<BottomNav screen="Search" setScreen={setScreen} />,
		)

		expect(getByTestId('icon-search')).toBeTruthy()
	})

	it('shows solid icon for active Biblioteca tab', () => {
		const { getByTestId } = render(
			<BottomNav screen="Biblioteca" setScreen={setScreen} />,
		)

		expect(getByTestId('icon-library')).toBeTruthy()
	})

	it('shows solid icon for active Equalizer tab', () => {
		const { getByTestId } = render(
			<BottomNav screen="Equalizer" setScreen={setScreen} />,
		)

		expect(getByTestId('icon-options')).toBeTruthy()
	})

	it('shows yellow color for active tab icon', () => {
		const { getByTestId } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		const icon = getByTestId('icon-musical-notes')
		expect(icon).toHaveStyle({ color: '#FACC16' })
	})

	it('shows gray color for inactive tab icon', () => {
		const { getByTestId } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		const icon = getByTestId('icon-search-outline')
		expect(icon).toHaveStyle({ color: '#404047' })
	})

	it('applies primary text class to active tab label', () => {
		const { container } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		const label = container.querySelector(
			'[class*="text-primary"][class*="text-xs"]',
		)
		expect(label).toBeTruthy()
		expect(label).toHaveTextContent('Player')
	})

	it('applies secondary text class to inactive tab labels', () => {
		const { container } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		const labels = container.querySelectorAll(
			'[class*="text-text-secondary"][class*="text-xs"]',
		)
		expect(labels.length).toBe(3)
	})

	it('calls setScreen with Player when Player tab pressed', () => {
		const { getByText } = render(
			<BottomNav screen="Search" setScreen={setScreen} />,
		)

		fireEvent.click(getByText('Player'))
		expect(setScreen).toHaveBeenCalledWith('Player')
	})

	it('calls setScreen with Search when Search tab pressed', () => {
		const { getByText } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		fireEvent.click(getByText('Search'))
		expect(setScreen).toHaveBeenCalledWith('Search')
	})

	it('calls setScreen with Biblioteca when Biblioteca tab pressed', () => {
		const { getByText } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		fireEvent.click(getByText('Biblioteca'))
		expect(setScreen).toHaveBeenCalledWith('Biblioteca')
	})

	it('calls setScreen with Equalizer when Equalizer tab pressed', () => {
		const { getByText } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		fireEvent.click(getByText('Equalizador'))
		expect(setScreen).toHaveBeenCalledWith('Equalizer')
	})

	it('applies correct container styles', () => {
		const { container } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		const nav = container.firstChild as HTMLElement
		expect(nav).toHaveClass('flex-row')
		expect(nav).toHaveClass('justify-around')
		expect(nav).toHaveClass('border-t')
		expect(nav).toHaveClass('border-border')
		expect(nav).toHaveClass('px-4')
		expect(nav).toHaveClass('pb-4')
		expect(nav).toHaveClass('pt-3')
	})

	it('applies items-center to each tab', () => {
		const { container } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		const tabs = container.querySelectorAll('[class*="items-center"]')
		expect(tabs.length).toBe(4)
	})

	it('applies mt-1 and text-xs to tab labels', () => {
		const { container } = render(
			<BottomNav screen="Player" setScreen={setScreen} />,
		)

		const labels = container.querySelectorAll(
			'[class*="mt-1"][class*="text-xs"]',
		)
		expect(labels.length).toBe(4)
	})
})
