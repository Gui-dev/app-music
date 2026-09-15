import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CoverCacheRepository } from '../repositories/cover-cache-repository'

vi.mock('node-fetch', () => ({
	default: vi.fn(),
}))

const mockFetch = vi.fn()

let CoverService: typeof import('./cover-service').CoverService

beforeEach(async () => {
	vi.stubGlobal('fetch', mockFetch)

	const mod = await import('./cover-service')
	CoverService = mod.CoverService
})

function createMockCache(): CoverCacheRepository {
	return {
		findByArtistAlbum: vi.fn().mockResolvedValue(null),
		save: vi.fn().mockResolvedValue(undefined),
	} as unknown as CoverCacheRepository
}

describe('CoverService', () => {
	let coverService: InstanceType<typeof CoverService>
	let cache: CoverCacheRepository

	beforeEach(() => {
		vi.clearAllMocks()
		cache = createMockCache()
		coverService = new CoverService('test-api-key', cache)
	})

	it('should return cover URL from cache when available', async () => {
		vi.mocked(cache.findByArtistAlbum).mockResolvedValue(
			'https://example.com/cached.jpg',
		)

		const result = await coverService.getCover('The Beatles', 'Abbey Road')

		expect(result).toBe('https://example.com/cached.jpg')
		expect(cache.findByArtistAlbum).toHaveBeenCalledWith('The Beatles', 'Abbey Road')
		expect(mockFetch).not.toHaveBeenCalled()
	})

	it('should fetch from Last.fm and cache when not in cache', async () => {
		vi.mocked(cache.findByArtistAlbum).mockResolvedValue(null)
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
		expect(cache.save).toHaveBeenCalledWith('The Beatles', 'Abbey Road', 'https://example.com/large.jpg')
	})

	it('should return null when API returns error', async () => {
		vi.mocked(cache.findByArtistAlbum).mockResolvedValue(null)
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({
				error: 6,
				message: 'Album not found',
			}),
		})

		const result = await coverService.getCover('Unknown', 'Unknown')

		expect(result).toBeNull()
		expect(cache.save).not.toHaveBeenCalled()
	})

	it('should return null when fetch fails', async () => {
		vi.mocked(cache.findByArtistAlbum).mockResolvedValue(null)
		mockFetch.mockRejectedValue(new Error('Network error'))

		const result = await coverService.getCover('The Beatles', 'Abbey Road')

		expect(result).toBeNull()
	})

	it('should return null when response is not ok', async () => {
		vi.mocked(cache.findByArtistAlbum).mockResolvedValue(null)
		mockFetch.mockResolvedValue({
			ok: false,
			status: 500,
		})

		const result = await coverService.getCover('The Beatles', 'Abbey Road')

		expect(result).toBeNull()
	})

	it('should return null when no image is available', async () => {
		vi.mocked(cache.findByArtistAlbum).mockResolvedValue(null)
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
