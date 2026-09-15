import { describe, expect, it } from 'vitest'
import { createDatabase } from '../database/database'
import { CoverCacheRepository } from './cover-cache-repository'

describe('CoverCacheRepository', () => {
	it('should save and find cover by artist+album', async () => {
		const db = createDatabase(':memory:')
		const repo = new CoverCacheRepository(db)

		await repo.save('Queen', 'A Night at the Opera', 'https://example.com/cover.jpg')

		const found = await repo.findByArtistAlbum('Queen', 'A Night at the Opera')

		expect(found).toBe('https://example.com/cover.jpg')
	})

	it('should return null for non-existent entry', async () => {
		const db = createDatabase(':memory:')
		const repo = new CoverCacheRepository(db)

		const found = await repo.findByArtistAlbum('Unknown', 'Unknown Album')

		expect(found).toBeNull()
	})

	it('should update cover URL on duplicate', async () => {
		const db = createDatabase(':memory:')
		const repo = new CoverCacheRepository(db)

		await repo.save('Queen', 'A Night at the Opera', 'https://example.com/old.jpg')
		await repo.save('Queen', 'A Night at the Opera', 'https://example.com/new.jpg')

		const found = await repo.findByArtistAlbum('Queen', 'A Night at the Opera')

		expect(found).toBe('https://example.com/new.jpg')
	})

	it('should store multiple different albums', async () => {
		const db = createDatabase(':memory:')
		const repo = new CoverCacheRepository(db)

		await repo.save('Queen', 'A Night at the Opera', 'https://example.com/queen.jpg')
		await repo.save('The Beatles', 'Abbey Road', 'https://example.com/beatles.jpg')

		expect(await repo.findByArtistAlbum('Queen', 'A Night at the Opera')).toBe(
			'https://example.com/queen.jpg',
		)
		expect(await repo.findByArtistAlbum('The Beatles', 'Abbey Road')).toBe(
			'https://example.com/beatles.jpg',
		)
	})
})
