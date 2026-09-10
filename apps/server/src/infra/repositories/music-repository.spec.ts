import { describe, expect, it } from 'vitest'
import type { Music } from '../../domain/entities'
import { createDatabase } from '../database/database'
import { MusicRepository } from './music-repository'

describe('MusicRepository', () => {
	function createTestMusic(overrides: Partial<Music> = {}): Music {
		return {
			id: '1',
			title: 'Test Song',
			artist: 'Test Artist',
			album: 'Test Album',
			duration: 180,
			filePath: '/path/to/song.mp3',
			coverUrl: null,
			trackNumber: 1,
			year: 2024,
			...overrides,
		}
	}

	it('should save and find music by id', async () => {
		const db = createDatabase(':memory:')
		const repo = new MusicRepository(db)
		const music = createTestMusic()

		await repo.save(music)
		const found = await repo.findById('1')

		expect(found).not.toBeNull()
		expect(found?.id).toBe('1')
		expect(found?.title).toBe('Test Song')
	})

	it('should return null for non-existent id', async () => {
		const db = createDatabase(':memory:')
		const repo = new MusicRepository(db)

		const found = await repo.findById('non-existent')

		expect(found).toBeNull()
	})

	it('should find all musics', async () => {
		const db = createDatabase(':memory:')
		const repo = new MusicRepository(db)

		await repo.save(createTestMusic({ id: '1', title: 'Song 1' }))
		await repo.save(createTestMusic({ id: '2', title: 'Song 2' }))

		const all = await repo.findAll()

		expect(all).toHaveLength(2)
	})

	it('should search musics by title, artist, or album', async () => {
		const db = createDatabase(':memory:')
		const repo = new MusicRepository(db)

		await repo.save(
			createTestMusic({
				id: '1',
				title: 'Yellow Submarine',
				artist: 'The Beatles',
				album: 'Yellow Submarine',
			}),
		)
		await repo.save(
			createTestMusic({
				id: '2',
				title: 'Hey Jude',
				artist: 'The Beatles',
				album: 'Hey Jude',
			}),
		)
		await repo.save(
			createTestMusic({
				id: '3',
				title: 'Bohemian Rhapsody',
				artist: 'Queen',
				album: 'A Night at the Opera',
			}),
		)

		const byTitle = await repo.search('Yellow')
		expect(byTitle).toHaveLength(1)
		expect(byTitle[0].title).toBe('Yellow Submarine')

		const byArtist = await repo.search('Queen')
		expect(byArtist).toHaveLength(1)
		expect(byArtist[0].artist).toBe('Queen')

		const byAlbum = await repo.search('Night')
		expect(byAlbum).toHaveLength(1)
		expect(byAlbum[0].album).toBe('A Night at the Opera')
	})

	it('should find musics by album', async () => {
		const db = createDatabase(':memory:')
		const repo = new MusicRepository(db)

		await repo.save(createTestMusic({ id: '1', album: 'Abbey Road' }))
		await repo.save(createTestMusic({ id: '2', album: 'Abbey Road' }))
		await repo.save(createTestMusic({ id: '3', album: 'Let It Be' }))

		const found = await repo.findByAlbum('Abbey Road')

		expect(found).toHaveLength(2)
	})

	it('should find musics by artist', async () => {
		const db = createDatabase(':memory:')
		const repo = new MusicRepository(db)

		await repo.save(createTestMusic({ id: '1', artist: 'The Beatles' }))
		await repo.save(createTestMusic({ id: '2', artist: 'The Beatles' }))
		await repo.save(createTestMusic({ id: '3', artist: 'Queen' }))

		const found = await repo.findByArtist('The Beatles')

		expect(found).toHaveLength(2)
	})

	it('should update existing music on save', async () => {
		const db = createDatabase(':memory:')
		const repo = new MusicRepository(db)

		await repo.save(createTestMusic({ id: '1', title: 'Old Title' }))
		await repo.save(createTestMusic({ id: '1', title: 'New Title' }))

		const found = await repo.findById('1')

		expect(found?.title).toBe('New Title')
	})

	it('should save many musics at once', async () => {
		const db = createDatabase(':memory:')
		const repo = new MusicRepository(db)

		await repo.saveMany([
			createTestMusic({ id: '1', title: 'Song 1' }),
			createTestMusic({ id: '2', title: 'Song 2' }),
			createTestMusic({ id: '3', title: 'Song 3' }),
		])

		const all = await repo.findAll()
		expect(all).toHaveLength(3)
	})
})
