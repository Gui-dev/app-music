import { describe, expect, it } from 'vitest'
import type { Music } from '@/domain/entities'
import { DomainError } from '@/domain/errors/domain-error'
import { InMemoryMusicRepository } from '@/infra/repositories/in-memory/in-memory-music-repository'
import { InMemoryPlaylistRepository } from '@/infra/repositories/in-memory/in-memory-playlist-repository'
import { AddMusicToPlaylist } from './add-music-to-playlist'

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

describe('AddMusicToPlaylist', () => {
	it('should add music to playlist', async () => {
		const playlistRepo = new InMemoryPlaylistRepository()
		const musicRepo = new InMemoryMusicRepository()
		const useCase = new AddMusicToPlaylist(playlistRepo, musicRepo)

		const created = await playlistRepo.create('My Playlist')
		await musicRepo.save(createTestMusic({ id: '1' }))

		await useCase.execute({ playlistId: created.id, musicId: '1' })

		const updated = await playlistRepo.findById(created.id)
		expect(updated?.musicIds).toContain('1')
	})

	it('should throw DomainError for non-existent playlist', async () => {
		const playlistRepo = new InMemoryPlaylistRepository()
		const musicRepo = new InMemoryMusicRepository()
		const useCase = new AddMusicToPlaylist(playlistRepo, musicRepo)

		await expect(
			useCase.execute({ playlistId: 'non-existent', musicId: '1' }),
		).rejects.toThrow(DomainError)
	})

	it('should throw DomainError for non-existent music', async () => {
		const playlistRepo = new InMemoryPlaylistRepository()
		const musicRepo = new InMemoryMusicRepository()
		const useCase = new AddMusicToPlaylist(playlistRepo, musicRepo)

		const created = await playlistRepo.create('My Playlist')

		await expect(
			useCase.execute({ playlistId: created.id, musicId: 'non-existent' }),
		).rejects.toThrow(DomainError)
	})

	it('should throw DomainError for duplicate music in playlist', async () => {
		const playlistRepo = new InMemoryPlaylistRepository()
		const musicRepo = new InMemoryMusicRepository()
		const useCase = new AddMusicToPlaylist(playlistRepo, musicRepo)

		const created = await playlistRepo.create('My Playlist')
		await musicRepo.save(createTestMusic({ id: '1' }))

		await useCase.execute({ playlistId: created.id, musicId: '1' })

		await expect(
			useCase.execute({ playlistId: created.id, musicId: '1' }),
		).rejects.toThrow(DomainError)
	})
})
