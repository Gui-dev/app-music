import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { createDatabase } from './database'
import { musics, playlists } from './schemas'

describe('createDatabase', () => {
	it('should create a database instance', () => {
		const db = createDatabase(':memory:')

		expect(db).toBeDefined()
	})

	it('should enable foreign keys', () => {
		const db = createDatabase(':memory:')

		const foreignKeys = db.$client.pragma('foreign_keys', { simple: true })

		expect(foreignKeys).toBe(1)
	})

	it('should allow inserting and querying music via Drizzle', async () => {
		const db = createDatabase(':memory:')

		await db.insert(musics).values({
			id: '1',
			title: 'Song Title',
			artist: 'Artist Name',
			album: 'Album Name',
			duration: 180,
			filePath: '/path/to/file.mp3',
		})

		const result = await db.select().from(musics).where(eq(musics.id, '1'))

		expect(result).toHaveLength(1)
		expect(result[0].id).toBe('1')
		expect(result[0].title).toBe('Song Title')
		expect(result[0].artist).toBe('Artist Name')
		expect(result[0].album).toBe('Album Name')
		expect(result[0].duration).toBe(180)
		expect(result[0].filePath).toBe('/path/to/file.mp3')
	})

	it('should allow inserting and querying playlists via Drizzle', async () => {
		const db = createDatabase(':memory:')

		await db.insert(playlists).values({
			id: '1',
			name: 'My Playlist',
		})

		const result = await db
			.select()
			.from(playlists)
			.where(eq(playlists.id, '1'))

		expect(result).toHaveLength(1)
		expect(result[0].id).toBe('1')
		expect(result[0].name).toBe('My Playlist')
	})
})
