import type { ICoverCacheRepository } from '@/domain/contracts/repositories/i-cover-cache-repository'
import type { ICoverService } from '@/domain/contracts/services/i-cover-service'

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/'

export class CoverService implements ICoverService {
	constructor(
		private readonly apiKey: string,
		private readonly cacheRepository: ICoverCacheRepository,
	) {}

	async getCover(artist: string, album: string): Promise<string | null> {
		const cached = await this.cacheRepository.findByArtistAlbum(artist, album)
		if (cached) {
			return cached
		}

		const coverUrl = await this.fetchFromLastFm(artist, album)

		if (coverUrl) {
			await this.cacheRepository.save(artist, album, coverUrl)
		}

		return coverUrl
	}

	private async fetchFromLastFm(
		artist: string,
		album: string,
	): Promise<string | null> {
		try {
			const params = new URLSearchParams({
				method: 'album.getinfo',
				api_key: this.apiKey,
				artist,
				album,
				format: 'json',
			})

			const response = await fetch(`${LASTFM_API_URL}?${params}`)

			if (!response.ok) {
				return null
			}

			const data = (await response.json()) as LastFmResponse

			if (data.error) {
				return null
			}

			const image = data.album?.image?.find(
				(img) => img.size === 'extralarge' || img.size === 'large',
			)

			return image?.['#text'] || null
		} catch {
			return null
		}
	}
}

interface LastFmResponse {
	album?: {
		image: Array<{
			size: string
			'#text': string
		}>
	}
	error?: number
}
