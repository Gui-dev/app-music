import { View } from 'react-native'
import { render, screen } from '@testing-library/react'
import { PlayerSkeleton } from './player-skeleton'

vi.mock('react-native-modern-shimmer', () => ({
	default: (props: any) => (
		<View testID="shimmer" accessibilityLabel={`shimmer-${props.width}-${props.height}`} />
	),
}))

it('renders shimmer placeholders', () => {
	render(<PlayerSkeleton />)

	const shimmers = screen.getAllByTestId('shimmer')
	expect(shimmers.length).toBeGreaterThanOrEqual(4)
})

it('renders cover art skeleton (256x256)', () => {
	render(<PlayerSkeleton />)

	const cover = screen.getByLabelText('shimmer-256-256')
	expect(cover).toBeTruthy()
})

it('renders play button skeleton (64x64)', () => {
	render(<PlayerSkeleton />)

	const playButton = screen.getByLabelText('shimmer-64-64')
	expect(playButton).toBeTruthy()
})

it('renders control buttons (32x32)', () => {
	render(<PlayerSkeleton />)

	const prev = screen.getAllByLabelText('shimmer-32-32')
	expect(prev.length).toBe(2)
})
