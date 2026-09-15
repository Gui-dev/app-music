import { and, eq } from 'drizzle-orm'
import type { AppDatabase } from '../database/database'
import { coverCache } from '../database/schemas'

export class CoverCacheRepository {
	constructor(private readonly db: AppDatabase) {}

	async findByArtistAlbum(
		artist: string,
		album: string,
	): Promise<string | null> {
		const rows = await this.db
			.select()
			.from(coverCache)
			.where(
				and(eq(coverCache.artist, artist), eq(coverCache.album, album)),
			)
			.limit(1)

		return rows[0]?.coverUrl ?? null
	}

	async save(
		artist: string,
		album: string,
		coverUrl: string,
	): Promise<void> {
		await this.db
			.insert(coverCache)
			.values({ artist, album, coverUrl })
			.onConflictDoUpdate({
				target: [coverCache.artist, coverCache.album],
				set: { coverUrl },
			})
	}
}
