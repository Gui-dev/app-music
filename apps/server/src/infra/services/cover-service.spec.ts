import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node-fetch', () => ({
	default: vi.fn(),
}))

const mockFetch = vi.fn()

let CoverService: typeof import('./cover-service').CoverService

beforeAll(async () => {
	vi.stubGlobal('fetch', mockFetch)

	const mod = await import('./cover-service')
	CoverService = mod.CoverService
})

describe('CoverService', () => {
	let coverService: InstanceType<typeof CoverService>

	beforeEach(() => {
		vi.clearAllMocks()
		coverService = new CoverService('test-api-key')
	})

	it('should return cover URL from Last.fm', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({
				album: {
					image: [
						{ size: 'small', '#text': 'https://example.com/small.jpg' },
						{ size: 'extralarge', '#text': 'https://example.com/large.jpg' },
					],
				},
			}),
		})

		const result = await coverService.getCover('The Beatles', 'Abbey Road')

		expect(result).toBe('https://example.com/large.jpg')
	})

	it('should return null when API returns error', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({
				error: 6,
				message: 'Album not found',
			}),
		})

		const result = await coverService.getCover('Unknown', 'Unknown')

		expect(result).toBeNull()
	})

	it('should return null when fetch fails', async () => {
		mockFetch.mockRejectedValue(new Error('Network error'))

		const result = await coverService.getCover('The Beatles', 'Abbey Road')

		expect(result).toBeNull()
	})

	it('should return null when response is not ok', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 500,
		})

		const result = await coverService.getCover('The Beatles', 'Abbey Road')

		expect(result).toBeNull()
	})

	it('should return null when no image is available', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({
				album: {
					image: [],
				},
			}),
		})

		const result = await coverService.getCover('The Beatles', 'Abbey Road')

		expect(result).toBeNull()
	})
})
