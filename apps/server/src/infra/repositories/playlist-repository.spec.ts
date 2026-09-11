import { describe, expect, it } from 'vitest'
import type { Music } from '@/domain/entities'
import { createDatabase } from '../database/database'
import { MusicRepository } from './music-repository'
import { PlaylistRepository } from './playlist-repository'

describe('PlaylistRepository', () => {
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

	it('should create a playlist', async () => {
		const db = createDatabase(':memory:')
		const repo = new PlaylistRepository(db)

		const playlist = await repo.create('My Playlist')

		expect(playlist.id).toBeDefined()
		expect(playlist.name).toBe('My Playlist')
		expect(playlist.musicIds).toEqual([])
	})

	it('should find playlist by id', async () => {
		const db = createDatabase(':memory:')
		const repo = new PlaylistRepository(db)

		const created = await repo.create('My Playlist')
		const found = await repo.findById(created.id)

		expect(found).not.toBeNull()
		expect(found?.name).toBe('My Playlist')
	})

	it('should return null for non-existent id', async () => {
		const db = createDatabase(':memory:')
		const repo = new PlaylistRepository(db)

		const found = await repo.findById('non-existent')

		expect(found).toBeNull()
	})

	it('should find all playlists', async () => {
		const db = createDatabase(':memory:')
		const repo = new PlaylistRepository(db)

		await repo.create('Playlist 1')
		await repo.create('Playlist 2')

		const all = await repo.findAll()

		expect(all).toHaveLength(2)
	})

	it('should add music to playlist', async () => {
		const db = createDatabase(':memory:')
		const playlistRepo = new PlaylistRepository(db)
		const musicRepo = new MusicRepository(db)

		const playlist = await playlistRepo.create('My Playlist')
		await musicRepo.save(createTestMusic({ id: 'music-1' }))

		await playlistRepo.addMusic(playlist.id, 'music-1')
		const found = await playlistRepo.findById(playlist.id)

		expect(found?.musicIds).toEqual(['music-1'])
	})

	it('should not add duplicate music to playlist', async () => {
		const db = createDatabase(':memory:')
		const playlistRepo = new PlaylistRepository(db)
		const musicRepo = new MusicRepository(db)

		const playlist = await playlistRepo.create('My Playlist')
		await musicRepo.save(createTestMusic({ id: 'music-1' }))

		await playlistRepo.addMusic(playlist.id, 'music-1')
		await playlistRepo.addMusic(playlist.id, 'music-1')
		const found = await playlistRepo.findById(playlist.id)

		expect(found?.musicIds).toEqual(['music-1'])
	})

	it('should remove music from playlist', async () => {
		const db = createDatabase(':memory:')
		const playlistRepo = new PlaylistRepository(db)
		const musicRepo = new MusicRepository(db)

		const playlist = await playlistRepo.create('My Playlist')
		await musicRepo.save(createTestMusic({ id: 'music-1' }))
		await musicRepo.save(createTestMusic({ id: 'music-2' }))

		await playlistRepo.addMusic(playlist.id, 'music-1')
		await playlistRepo.addMusic(playlist.id, 'music-2')
		await playlistRepo.removeMusic(playlist.id, 'music-1')
		const found = await playlistRepo.findById(playlist.id)

		expect(found?.musicIds).toEqual(['music-2'])
	})

	it('should delete playlist', async () => {
		const db = createDatabase(':memory:')
		const repo = new PlaylistRepository(db)

		const playlist = await repo.create('My Playlist')
		await repo.delete(playlist.id)
		const found = await repo.findById(playlist.id)

		expect(found).toBeNull()
	})

	it('should maintain music order', async () => {
		const db = createDatabase(':memory:')
		const playlistRepo = new PlaylistRepository(db)
		const musicRepo = new MusicRepository(db)

		const playlist = await playlistRepo.create('My Playlist')
		await musicRepo.save(createTestMusic({ id: 'music-1' }))
		await musicRepo.save(createTestMusic({ id: 'music-2' }))
		await musicRepo.save(createTestMusic({ id: 'music-3' }))

		await playlistRepo.addMusic(playlist.id, 'music-3')
		await playlistRepo.addMusic(playlist.id, 'music-1')
		await playlistRepo.addMusic(playlist.id, 'music-2')

		const found = await playlistRepo.findById(playlist.id)

		expect(found?.musicIds).toEqual(['music-3', 'music-1', 'music-2'])
	})
})
