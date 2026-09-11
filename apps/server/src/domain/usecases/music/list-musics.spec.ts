import { describe, expect, it } from 'vitest'
import { InMemoryMusicRepository } from '@/infra/repositories/in-memory/in-memory-music-repository'
import type { Music } from '@/domain/entities'
import { ListMusics } from './list-musics'

describe('ListMusics', () => {
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

	it('should return all musics', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new ListMusics(repo)

		await repo.save(createTestMusic({ id: '1', title: 'Song 1' }))
		await repo.save(createTestMusic({ id: '2', title: 'Song 2' }))

		const result = await useCase.execute()

		expect(result).toHaveLength(2)
	})

	it('should return empty array when no musics exist', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new ListMusics(repo)

		const result = await useCase.execute()

		expect(result).toHaveLength(0)
	})
})
