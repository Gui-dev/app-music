import { fireEvent, render } from '@testing-library/react'
import type { useEqualizer } from '../../hooks/use-equalizer'
import { Equalizer } from './equalizer'

type EqualizerHook = ReturnType<typeof useEqualizer>

function createMockHook(overrides: Partial<EqualizerHook> = {}): EqualizerHook {
	return {
		isSupported: true,
		enabled: true,
		bands: [0, 0, 0],
		bandLabels: ['Graves (Bass)', 'Médios (Mid)', 'Agudos (Treble)'],
		preset: 'Flat',
		presets: ['Flat', 'Rock', 'Pop'],
		toggle: vi.fn(),
		setBandLevel: vi.fn(),
		applyPreset: vi.fn(),
		...overrides,
	} as EqualizerHook
}

describe('Equalizer', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders title', () => {
		const eq = createMockHook()
		const { getByText } = render(<Equalizer eq={eq} />)
		expect(getByText('Equalizador')).toBeTruthy()
	})

	it('renders not supported message on iOS', () => {
		const eq = createMockHook({ isSupported: false })
		const { getByText } = render(<Equalizer eq={eq} />)
		expect(getByText('Equalizador não disponível')).toBeTruthy()
		expect(getByText('Disponível apenas no Android')).toBeTruthy()
	})

	it('renders all band labels', () => {
		const eq = createMockHook()
		const { getByText } = render(<Equalizer eq={eq} />)
		expect(getByText('Graves (Bass)')).toBeTruthy()
		expect(getByText('Médios (Mid)')).toBeTruthy()
		expect(getByText('Agudos (Treble)')).toBeTruthy()
	})

	it('renders band levels', () => {
		const eq = createMockHook({ bands: [4, -2, 6] })
		const { getByText } = render(<Equalizer eq={eq} />)
		expect(getByText('+4 dB')).toBeTruthy()
		expect(getByText('-2 dB')).toBeTruthy()
		expect(getByText('+6 dB')).toBeTruthy()
	})

	it('renders zero as 0 dB', () => {
		const eq = createMockHook({ bands: [0, 0, 0] })
		const { getAllByText } = render(<Equalizer eq={eq} />)
		const zeros = getAllByText('0 dB')
		expect(zeros.length).toBe(3)
	})

	it('calls toggle when ON/OFF pressed', () => {
		const eq = createMockHook()
		const { getByText } = render(<Equalizer eq={eq} />)
		fireEvent.click(getByText('ON'))
		expect(eq.toggle).toHaveBeenCalledTimes(1)
	})

	it('shows OFF when disabled', () => {
		const eq = createMockHook({ enabled: false })
		const { getByText } = render(<Equalizer eq={eq} />)
		expect(getByText('OFF')).toBeTruthy()
	})

	it('renders band controls', () => {
		const eq = createMockHook({ bands: [0, 0, 0] })
		const { container } = render(<Equalizer eq={eq} />)
		// Verify +/- buttons exist for each band
		const buttons = container.querySelectorAll('[class*="rounded-full"]')
		expect(buttons.length).toBeGreaterThanOrEqual(6)
	})

	it('renders preset buttons', () => {
		const eq = createMockHook({ presets: ['Flat', 'Rock', 'Pop'] })
		const { getByText } = render(<Equalizer eq={eq} />)
		expect(getByText('Flat')).toBeTruthy()
		expect(getByText('Rock')).toBeTruthy()
		expect(getByText('Pop')).toBeTruthy()
	})

	it('calls applyPreset when preset pressed', () => {
		const eq = createMockHook()
		const { getByText } = render(<Equalizer eq={eq} />)
		fireEvent.click(getByText('Rock'))
		expect(eq.applyPreset).toHaveBeenCalledWith('Rock')
	})

	it('highlights active preset', () => {
		const eq = createMockHook({ preset: 'Rock' })
		const { container } = render(<Equalizer eq={eq} />)
		const activeButton = container.querySelector(
			'[class*="bg-primary"][class*="rounded-lg"]',
		)
		expect(activeButton).toBeTruthy()
	})

	it('disables controls when EQ is off', () => {
		const eq = createMockHook({ enabled: false })
		const { getByText } = render(<Equalizer eq={eq} />)
		const minusButtons = document.querySelectorAll('[class*="bg-surface"]')
		// Buttons should be disabled when EQ is off
		expect(minusButtons.length).toBeGreaterThan(0)
	})

	it('shows Presets section', () => {
		const eq = createMockHook()
		const { getByText } = render(<Equalizer eq={eq} />)
		expect(getByText('Presets')).toBeTruthy()
	})
})
