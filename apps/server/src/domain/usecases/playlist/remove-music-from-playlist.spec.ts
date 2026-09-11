import { describe, expect, it } from 'vitest'
import { DomainError } from '@/domain/errors/domain-error'
import { InMemoryPlaylistRepository } from '@/infra/repositories/in-memory/in-memory-playlist-repository'
import { RemoveMusicFromPlaylist } from './remove-music-from-playlist'

describe('RemoveMusicFromPlaylist', () => {
	it('should remove music from playlist', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new RemoveMusicFromPlaylist(repo)

		const playlist = await repo.create('My Playlist')
		await repo.addMusic(playlist.id, '1')

		await useCase.execute({ playlistId: playlist.id, musicId: '1' })

		const updated = await repo.findById(playlist.id)
		expect(updated?.musicIds).not.toContain('1')
	})

	it('should throw DomainError for non-existent playlist', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new RemoveMusicFromPlaylist(repo)

		await expect(
			useCase.execute({ playlistId: 'non-existent', musicId: '1' }),
		).rejects.toThrow(DomainError)
	})

	it('should throw DomainError for music not in playlist', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new RemoveMusicFromPlaylist(repo)

		const playlist = await repo.create('My Playlist')

		await expect(
			useCase.execute({ playlistId: playlist.id, musicId: '1' }),
		).rejects.toThrow(DomainError)
	})
})
