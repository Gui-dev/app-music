import { describe, expect, it } from 'vitest'
import { InMemoryPlaylistRepository } from '@/infra/repositories/in-memory/in-memory-playlist-repository'
import { ListPlaylists } from './list-playlists'

describe('ListPlaylists', () => {
	it('should return empty array when no playlists exist', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new ListPlaylists(repo)

		const result = await useCase.execute()

		expect(result).toEqual([])
	})

	it('should return all playlists', async () => {
		const repo = new InMemoryPlaylistRepository()
		const useCase = new ListPlaylists(repo)

		await repo.create('Playlist 1')
		await repo.create('Playlist 2')

		const result = await useCase.execute()

		expect(result).toHaveLength(2)
		expect(result[0].name).toBe('Playlist 1')
		expect(result[1].name).toBe('Playlist 2')
	})
})
