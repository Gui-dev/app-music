import { eq } from 'drizzle-orm'
import type { IPlaylistRepository } from '@/domain/contracts'
import type { Playlist } from '@/domain/entities'
import type { AppDatabase } from '../database/database'
import { playlistMusics, playlists } from '../database/schemas'

export class PlaylistRepository implements IPlaylistRepository {
	constructor(private readonly db: AppDatabase) {}

	async findAll(): Promise<Playlist[]> {
		const rows = await this.db.select().from(playlists)
		const playlistsList: Playlist[] = []

		for (const row of rows) {
			const musicIds = await this.getMusicIds(row.id)
			playlistsList.push(this.toDomain(row, musicIds))
		}

		return playlistsList
	}

	async findById(id: string): Promise<Playlist | null> {
		const rows = await this.db
			.select()
			.from(playlists)
			.where(eq(playlists.id, id))
			.limit(1)

		if (!rows[0]) return null

		const musicIds = await this.getMusicIds(id)
		return this.toDomain(rows[0], musicIds)
	}

	async findByName(name: string): Promise<Playlist | null> {
		const rows = await this.db
			.select()
			.from(playlists)
			.where(eq(playlists.name, name))
			.limit(1)

		if (!rows[0]) return null

		const musicIds = await this.getMusicIds(rows[0].id)
		return this.toDomain(rows[0], musicIds)
	}

	async update(playlist: Playlist): Promise<Playlist> {
		await this.db
			.update(playlists)
			.set({ name: playlist.name, updatedAt: new Date().toISOString() })
			.where(eq(playlists.id, playlist.id))

		return playlist
	}

	async create(name: string): Promise<Playlist> {
		const id = crypto.randomUUID()

		await this.db.insert(playlists).values({ id, name })

		return {
			id,
			name,
			musicIds: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		}
	}

	async addMusic(playlistId: string, musicId: string): Promise<void> {
		const existing = await this.db
			.select()
			.from(playlistMusics)
			.where(
				eq(playlistMusics.playlistId, playlistId) &&
					eq(playlistMusics.musicId, musicId),
			)
			.limit(1)

		if (existing[0]) return

		const maxPosition = await this.db
			.select({ max: playlistMusics.position })
			.from(playlistMusics)
			.where(eq(playlistMusics.playlistId, playlistId))

		const nextPosition = (maxPosition[0]?.max ?? -1) + 1

		await this.db.insert(playlistMusics).values({
			playlistId,
			musicId,
			position: nextPosition,
		})

		await this.updateTimestamp(playlistId)
	}

	async removeMusic(playlistId: string, musicId: string): Promise<void> {
		await this.db
			.delete(playlistMusics)
			.where(
				eq(playlistMusics.playlistId, playlistId) &&
					eq(playlistMusics.musicId, musicId),
			)

		await this.updateTimestamp(playlistId)
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(playlists).where(eq(playlists.id, id))
	}

	private async getMusicIds(playlistId: string): Promise<string[]> {
		const rows = await this.db
			.select({ musicId: playlistMusics.musicId })
			.from(playlistMusics)
			.where(eq(playlistMusics.playlistId, playlistId))
			.orderBy(playlistMusics.position)

		return rows.map((row) => row.musicId)
	}

	private async updateTimestamp(playlistId: string): Promise<void> {
		await this.db
			.update(playlists)
			.set({ updatedAt: new Date().toISOString() })
			.where(eq(playlists.id, playlistId))
	}

	private toDomain(
		row: typeof playlists.$inferSelect,
		musicIds: string[],
	): Playlist {
		const parseDate = (value: string | null): Date => {
			if (!value) return new Date()
			return new Date(value.replace(' ', 'T'))
		}
		return {
			id: row.id,
			name: row.name,
			musicIds,
			createdAt: parseDate(row.createdAt),
			updatedAt: parseDate(row.updatedAt),
		}
	}
}
