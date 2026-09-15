import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CoverArt } from './cover-art'

describe('CoverArt', () => {
	it('renders placeholder when coverUrl is null', () => {
		const { container } = render(<CoverArt coverUrl={null} size={48} />)
		expect(container.textContent).toContain('musical-notes')
	})

	it('renders placeholder when coverUrl is empty string', () => {
		const { container } = render(<CoverArt coverUrl="" size={48} />)
		expect(container.textContent).toContain('musical-notes')
	})

	it('renders image when coverUrl is provided', () => {
		const { container } = render(
			<CoverArt coverUrl="https://example.com/cover.jpg" size={64} />,
		)
		const wrapper = container.firstElementChild
		expect(wrapper?.className).toContain('rounded-lg')
		expect(wrapper?.getAttribute('aria-label')).toBe('Album cover')
	})

	it('applies custom className', () => {
		const { container } = render(
			<CoverArt coverUrl={null} size={48} className="mr-3" />,
		)
		const wrapper = container.firstElementChild
		expect(wrapper?.className).toContain('mr-3')
	})
})
