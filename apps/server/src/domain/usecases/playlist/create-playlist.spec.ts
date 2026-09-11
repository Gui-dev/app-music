import { describe, expect, it } from 'vitest'
import { DomainError } from '@/domain/errors/domain-error'
import { InMemoryPlaylistRepository } from '@/infra/repositories/in-memory/in-memory-playlist-repository'
import { CreatePlaylist } from './create-playlist'

describe('CreatePlaylist', () => {
	it('should create a playlist', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new CreatePlaylist(repo)

		const result = await useCase.execute({ name: 'My Playlist' })

		expect(result.name).toBe('My Playlist')
		expect(result.musicIds).toEqual([])
	})

	it('should throw DomainError for empty name', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new CreatePlaylist(repo)

		await expect(useCase.execute({ name: '' })).rejects.toThrow(DomainError)
	})

	it('should throw DomainError for whitespace-only name', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new CreatePlaylist(repo)

		await expect(useCase.execute({ name: '   ' })).rejects.toThrow(DomainError)
	})

	it('should throw DomainError for duplicate name', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new CreatePlaylist(repo)

		await repo.create('Existing')

		await expect(useCase.execute({ name: 'Existing' })).rejects.toThrow(
			DomainError,
		)
	})

	it('should trim whitespace from name', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new CreatePlaylist(repo)

		const result = await useCase.execute({ name: '  My Playlist  ' })

		expect(result.name).toBe('My Playlist')
	})
})
