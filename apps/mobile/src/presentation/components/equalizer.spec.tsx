import { fireEvent, render } from '@testing-library/react'
import { Equalizer } from './equalizer'

const defaultPresets = [
	{ label: 'FLAT', active: true, onPress: vi.fn() },
	{ label: 'BASS BOOST', onPress: vi.fn() },
	{ label: 'ROCK', onPress: vi.fn() },
]

describe('Equalizer', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders title', () => {
		const { getByText } = render(<Equalizer />)

		expect(getByText('Equalizador')).toBeTruthy()
	})

	it('renders all band labels', () => {
		const { getByText } = render(<Equalizer />)

		expect(getByText('Graves (Bass)')).toBeTruthy()
		expect(getByText('Médios (Mid)')).toBeTruthy()
		expect(getByText('Agudos (Treble)')).toBeTruthy()
	})

	it('renders positive band values with + prefix', () => {
		const { getByText } = render(<Equalizer />)

		expect(getByText('+4 dB')).toBeTruthy()
		expect(getByText('+1 dB')).toBeTruthy()
		expect(getByText('+3 dB')).toBeTruthy()
	})

	it('renders zero band value without + prefix', () => {
		const bands = [{ label: 'Bass', value: 0, max: 12 }]
		const { getByText } = render(<Equalizer bands={bands} />)

		expect(getByText('0 dB')).toBeTruthy()
	})

	it('renders negative band values with minus sign', () => {
		const bands = [{ label: 'Bass', value: -3, max: 12 }]
		const { getByText } = render(<Equalizer bands={bands} />)

		expect(getByText('-3 dB')).toBeTruthy()
	})

	it('renders band bar with correct width', () => {
		const bands = [{ label: 'Bass', value: 6, max: 12 }]
		const { container } = render(<Equalizer bands={bands} />)

		const filled = container.querySelector(
			'[class*="bg-primary"][class*="absolute"]',
		)
		expect(filled).toHaveStyle({ width: '50%' })
	})

	it('renders band bar at full width when value equals max', () => {
		const bands = [{ label: 'Bass', value: 12, max: 12 }]
		const { container } = render(<Equalizer bands={bands} />)

		const filled = container.querySelector(
			'[class*="bg-primary"][class*="absolute"]',
		)
		expect(filled).toHaveStyle({ width: '100%' })
	})

	it('renders band bar at 0% when value is 0', () => {
		const bands = [{ label: 'Bass', value: 0, max: 12 }]
		const { container } = render(<Equalizer bands={bands} />)

		const filled = container.querySelector(
			'[class*="bg-primary"][class*="absolute"]',
		)
		expect(filled).toHaveStyle({ width: '0%' })
	})

	it('renders Presets section title', () => {
		const { getByText } = render(<Equalizer />)

		expect(getByText('Presets')).toBeTruthy()
	})

	it('renders all preset buttons', () => {
		const { getByText } = render(<Equalizer presets={defaultPresets} />)

		expect(getByText('FLAT')).toBeTruthy()
		expect(getByText('BASS BOOST')).toBeTruthy()
		expect(getByText('ROCK')).toBeTruthy()
	})

	it('calls preset onPress when pressed', () => {
		const { getByText } = render(<Equalizer presets={defaultPresets} />)

		fireEvent.click(getByText('FLAT'))
		expect(defaultPresets[0].onPress).toHaveBeenCalledTimes(1)
	})

	it('applies active preset styles', () => {
		const { container } = render(<Equalizer presets={defaultPresets} />)

		const activeButton = container.querySelector(
			'[class*="bg-primary"][class*="rounded-lg"]',
		)
		expect(activeButton).toBeTruthy()
		expect(activeButton).toHaveClass('bg-primary')
	})

	it('applies inactive preset styles', () => {
		const { container } = render(<Equalizer presets={defaultPresets} />)

		const inactiveButtons = container.querySelectorAll(
			'[class*="bg-surface"][class*="rounded-lg"]',
		)
		expect(inactiveButtons.length).toBe(2)
	})

	it('applies bold text to active preset', () => {
		const { container } = render(<Equalizer presets={defaultPresets} />)

		const activeText = container.querySelector(
			'[class*="font-bold"][class*="text-bg"]',
		)
		expect(activeText).toBeTruthy()
		expect(activeText).toHaveTextContent('FLAT')
	})

	it('applies primary text to inactive presets', () => {
		const { getByText } = render(<Equalizer presets={defaultPresets} />)

		const bassBoost = getByText('BASS BOOST')
		expect(bassBoost).toHaveClass('text-text-primary')

		const rock = getByText('ROCK')
		expect(rock).toHaveClass('text-text-primary')
	})

	it('renders presets in a flex row', () => {
		const { container } = render(<Equalizer presets={defaultPresets} />)

		const presetsContainer = container.querySelector(
			'[class*="flex-row"][class*="gap-3"]',
		)
		expect(presetsContainer).toBeTruthy()
		expect(presetsContainer).toHaveClass('flex-wrap')
	})

	it('renders band track with correct styles', () => {
		const { container } = render(<Equalizer />)

		const tracks = container.querySelectorAll(
			'[class*="bg-surface"][class*="h-2"][class*="rounded-full"]',
		)
		expect(tracks.length).toBe(3)
	})

	it('renders custom bands', () => {
		const customBands = [
			{ label: 'Sub Bass', value: 8, max: 10 },
			{ label: 'High Mids', value: 2, max: 10 },
		]
		const { getByText } = render(<Equalizer bands={customBands} />)

		expect(getByText('Sub Bass')).toBeTruthy()
		expect(getByText('High Mids')).toBeTruthy()
		expect(getByText('+8 dB')).toBeTruthy()
		expect(getByText('+2 dB')).toBeTruthy()
	})

	it('applies correct container styles', () => {
		const { container } = render(<Equalizer />)

		const wrapper = container.firstChild as HTMLElement
		expect(wrapper).toHaveClass('p-4')
	})

	it('renders title with bold text', () => {
		const { container } = render(<Equalizer />)

		const title = container.querySelector(
			'[class*="text-2xl"][class*="font-bold"]',
		)
		expect(title).toBeTruthy()
		expect(title).toHaveClass('text-text-primary')
		expect(title).toHaveTextContent('Equalizador')
	})
})
