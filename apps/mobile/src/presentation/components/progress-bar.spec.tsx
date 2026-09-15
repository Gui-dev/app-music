import { render } from '@testing-library/react'
import { ProgressBar } from './progress-bar'

const defaultProps = {
	progress: 0.5,
	currentTime: 60000,
	duration: 180000,
	onSeek: vi.fn(),
}

describe('ProgressBar', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders current time formatted correctly', () => {
		const { getByText } = render(<ProgressBar {...defaultProps} />)

		expect(getByText('1:00')).toBeTruthy()
	})

	it('renders duration formatted correctly', () => {
		const { getByText } = render(<ProgressBar {...defaultProps} />)

		expect(getByText('3:00')).toBeTruthy()
	})

	it('formats zero time as 0:00', () => {
		const { getAllByText } = render(
			<ProgressBar {...defaultProps} currentTime={0} duration={0} />,
		)

		const zeros = getAllByText('0:00')
		expect(zeros.length).toBe(2)
	})

	it('formats seconds only (under 1 minute)', () => {
		const { getByText } = render(
			<ProgressBar {...defaultProps} currentTime={30000} duration={45000} />,
		)

		expect(getByText('0:30')).toBeTruthy()
		expect(getByText('0:45')).toBeTruthy()
	})

	it('formats minutes and seconds correctly', () => {
		const { getByText } = render(
			<ProgressBar {...defaultProps} currentTime={90000} duration={150000} />,
		)

		expect(getByText('1:30')).toBeTruthy()
		expect(getByText('2:30')).toBeTruthy()
	})

	it('formats large durations correctly', () => {
		const { getByText } = render(
			<ProgressBar
				{...defaultProps}
				currentTime={3661000}
				duration={7320000}
			/>,
		)

		expect(getByText('61:01')).toBeTruthy()
		expect(getByText('122:00')).toBeTruthy()
	})

	it('renders progress track with correct styles', () => {
		const { container } = render(<ProgressBar {...defaultProps} />)

		const track = container.querySelector(
			'[class*="bg-surface"][class*="rounded-full"][class*="h-2"]',
		)
		expect(track).toBeTruthy()
		expect(track).toHaveClass('h-2')
		expect(track).toHaveClass('bg-surface')
		expect(track).toHaveClass('rounded-full')
	})

	it('renders filled progress bar with correct width', () => {
		const { container } = render(
			<ProgressBar {...defaultProps} progress={0.3} />,
		)

		const filled = container.querySelector(
			'[class*="bg-primary"][class*="absolute"]',
		)
		expect(filled).toBeTruthy()
		expect(filled).toHaveStyle({ width: '30%' })
	})

	it('renders filled bar at 0% for progress 0', () => {
		const { container } = render(<ProgressBar {...defaultProps} progress={0} />)

		const filled = container.querySelector(
			'[class*="bg-primary"][class*="absolute"]',
		)
		expect(filled).toHaveStyle({ width: '0%' })
	})

	it('renders filled bar at 100% for progress 1', () => {
		const { container } = render(<ProgressBar {...defaultProps} progress={1} />)

		const filled = container.querySelector(
			'[class*="bg-primary"][class*="absolute"]',
		)
		expect(filled).toHaveStyle({ width: '100%' })
	})

	it('renders thumb element', () => {
		const { container } = render(<ProgressBar {...defaultProps} />)

		const thumb = container.querySelector(
			'[class*="w-4"][class*="h-4"][class*="bg-primary"][class*="rounded-full"]',
		)
		expect(thumb).toBeTruthy()
	})

	it('applies correct container styles', () => {
		const { container } = render(<ProgressBar {...defaultProps} />)

		const wrapper = container.firstChild as HTMLElement
		expect(wrapper).toHaveClass('w-full')
		expect(wrapper).toHaveClass('px-4')
	})

	it('renders time labels with secondary text color', () => {
		const { container } = render(<ProgressBar {...defaultProps} />)

		const timeLabels = container.querySelectorAll(
			'[class*="text-text-secondary"]',
		)
		expect(timeLabels.length).toBe(2)
	})

	it('renders time labels with correct font size', () => {
		const { container } = render(<ProgressBar {...defaultProps} />)

		const timeLabels = container.querySelectorAll('[class*="text-xs"]')
		expect(timeLabels.length).toBe(2)
	})
})
