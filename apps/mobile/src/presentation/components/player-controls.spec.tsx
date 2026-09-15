import { fireEvent, render } from '@testing-library/react'
import { PlayerControls } from './player-controls'

const defaultProps = {
	isPlaying: false,
	onPlay: vi.fn(),
	onPause: vi.fn(),
	onPrev: vi.fn(),
	onNext: vi.fn(),
}

function getButtonByIcon(container: HTMLElement, iconName: string) {
	const icon = container.querySelector(`[data-testid="icon-${iconName}"]`)
	return icon?.parentElement as HTMLElement
}

describe('PlayerControls', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders all control buttons', () => {
		const { getByTestId } = render(<PlayerControls {...defaultProps} />)

		expect(getByTestId('icon-shuffle-outline')).toBeTruthy()
		expect(getByTestId('icon-chevron-back-circle')).toBeTruthy()
		expect(getByTestId('icon-play')).toBeTruthy()
		expect(getByTestId('icon-chevron-forward-circle')).toBeTruthy()
		expect(getByTestId('icon-repeat-outline')).toBeTruthy()
	})

	it('shows play icon when not playing', () => {
		const { getByTestId } = render(
			<PlayerControls {...defaultProps} isPlaying={false} />,
		)

		expect(getByTestId('icon-play')).toBeTruthy()
	})

	it('shows pause icon when playing', () => {
		const { getByTestId } = render(
			<PlayerControls {...defaultProps} isPlaying={true} />,
		)

		expect(getByTestId('icon-pause')).toBeTruthy()
	})

	it('calls onPlay when play button pressed while paused', () => {
		const { container } = render(
			<PlayerControls {...defaultProps} isPlaying={false} />,
		)

		const button = getButtonByIcon(container, 'play')
		fireEvent.click(button)
		expect(defaultProps.onPlay).toHaveBeenCalledTimes(1)
	})

	it('calls onPause when pause button pressed while playing', () => {
		const { container } = render(
			<PlayerControls {...defaultProps} isPlaying={true} />,
		)

		const button = getButtonByIcon(container, 'pause')
		fireEvent.click(button)
		expect(defaultProps.onPause).toHaveBeenCalledTimes(1)
	})

	it('calls onPrev when prev button pressed', () => {
		const { container } = render(<PlayerControls {...defaultProps} />)

		const button = getButtonByIcon(container, 'chevron-back-circle')
		fireEvent.click(button)
		expect(defaultProps.onPrev).toHaveBeenCalledTimes(1)
	})

	it('calls onNext when next button pressed', () => {
		const { container } = render(<PlayerControls {...defaultProps} />)

		const button = getButtonByIcon(container, 'chevron-forward-circle')
		fireEvent.click(button)
		expect(defaultProps.onNext).toHaveBeenCalledTimes(1)
	})

	it('calls onShuffle when shuffle button pressed', () => {
		const onShuffle = vi.fn()
		const { container } = render(
			<PlayerControls {...defaultProps} onShuffle={onShuffle} />,
		)

		const button = getButtonByIcon(container, 'shuffle-outline')
		fireEvent.click(button)
		expect(onShuffle).toHaveBeenCalledTimes(1)
	})

	it('calls onRepeat when repeat button pressed', () => {
		const onRepeat = vi.fn()
		const { container } = render(
			<PlayerControls {...defaultProps} onRepeat={onRepeat} />,
		)

		const button = getButtonByIcon(container, 'repeat-outline')
		fireEvent.click(button)
		expect(onRepeat).toHaveBeenCalledTimes(1)
	})

	it('shows shuffle active state with yellow color', () => {
		const onShuffle = vi.fn()
		const { getByTestId } = render(
			<PlayerControls
				{...defaultProps}
				onShuffle={onShuffle}
				shuffleActive={true}
			/>,
		)

		const icon = getByTestId('icon-shuffle')
		expect(icon).toBeTruthy()
		expect(icon).toHaveStyle({ color: '#FACC16' })
	})

	it('shows repeat active state with yellow color', () => {
		const onRepeat = vi.fn()
		const { getByTestId } = render(
			<PlayerControls
				{...defaultProps}
				onRepeat={onRepeat}
				repeatActive={true}
			/>,
		)

		const icon = getByTestId('icon-repeat')
		expect(icon).toBeTruthy()
		expect(icon).toHaveStyle({ color: '#FACC16' })
	})

	it('disables shuffle when onShuffle not provided', () => {
		const { container } = render(<PlayerControls {...defaultProps} />)

		const shuffleButton = container.querySelector('[class*="p-2"]')
		expect(shuffleButton).toHaveAttribute('disabled')
	})

	it('disables repeat when onRepeat not provided', () => {
		const { container } = render(<PlayerControls {...defaultProps} />)

		const buttons = container.querySelectorAll('[class*="p-2"]')
		const repeatButton = buttons[buttons.length - 1]
		expect(repeatButton).toHaveAttribute('disabled')
	})

	it('applies correct container styles', () => {
		const { container } = render(<PlayerControls {...defaultProps} />)

		const controlsContainer = container.firstChild as HTMLElement
		expect(controlsContainer).toHaveClass('flex-row')
		expect(controlsContainer).toHaveClass('items-center')
		expect(controlsContainer).toHaveClass('justify-center')
		expect(controlsContainer).toHaveClass('gap-6')
		expect(controlsContainer).toHaveClass('py-4')
	})

	it('applies primary background to play/pause button', () => {
		const { container } = render(<PlayerControls {...defaultProps} />)

		const playButton = container.querySelector('[class*="bg-primary"]')
		expect(playButton).toBeTruthy()
		expect(playButton).toHaveClass('h-16')
		expect(playButton).toHaveClass('w-16')
		expect(playButton).toHaveClass('rounded-full')
	})
})
