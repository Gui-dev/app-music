import { describe, expect, it } from 'vitest'
import type { Music } from '@/domain/entities'
import { InMemoryMusicRepository } from '@/infra/repositories/in-memory/in-memory-music-repository'
import { GetMusicById } from './get-music-by-id'

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

describe('GetMusicById', () => {
	it('should return music by id', async () => {
		const repo = new InMemoryMusicRepository()
		await repo.save(createTestMusic({ id: '1', title: 'Song 1' }))
		await repo.save(createTestMusic({ id: '2', title: 'Song 2' }))
		const useCase = new GetMusicById(repo)

		const result = await useCase.execute('1')

		expect(result.id).toBe('1')
		expect(result.title).toBe('Song 1')
	})

	it('should throw when music not found', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new GetMusicById(repo)

		await expect(useCase.execute('nonexistent')).rejects.toThrow(
			'Music not found',
		)
	})
})
