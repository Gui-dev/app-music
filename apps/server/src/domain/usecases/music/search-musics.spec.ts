import { describe, expect, it } from 'vitest'
import type { Music } from '@/domain/entities'
import { DomainError } from '@/domain/errors/domain-error'
import { InMemoryMusicRepository } from '@/infra/repositories/in-memory/in-memory-music-repository'
import { SearchMusics } from './search-musics'

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

describe('SearchMusics', () => {
	it('should find musics by title', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new SearchMusics(repo)

		await repo.save(createTestMusic({ id: '1', title: 'Yellow Submarine' }))
		await repo.save(createTestMusic({ id: '2', title: 'Hey Jude' }))

		const result = await useCase.execute('Yellow')

		expect(result).toHaveLength(1)
		expect(result[0].title).toBe('Yellow Submarine')
	})

	it('should find musics by artist', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new SearchMusics(repo)

		await repo.save(createTestMusic({ id: '1', artist: 'The Beatles' }))
		await repo.save(createTestMusic({ id: '2', artist: 'Queen' }))

		const result = await useCase.execute('Beatles')

		expect(result).toHaveLength(1)
		expect(result[0].artist).toBe('The Beatles')
	})

	it('should find musics by album', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new SearchMusics(repo)

		await repo.save(createTestMusic({ id: '1', album: 'Abbey Road' }))
		await repo.save(createTestMusic({ id: '2', album: 'Let It Be' }))

		const result = await useCase.execute('Abbey')

		expect(result).toHaveLength(1)
		expect(result[0].album).toBe('Abbey Road')
	})

	it('should return empty array for no matches', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new SearchMusics(repo)

		await repo.save(createTestMusic({ id: '1', title: 'Song' }))

		const result = await useCase.execute('nonexistent')

		expect(result).toHaveLength(0)
	})

	it('should throw DomainError for empty query', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new SearchMusics(repo)

		await expect(useCase.execute('')).rejects.toThrow(DomainError)
	})

	it('should throw DomainError for whitespace-only query', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new SearchMusics(repo)

		await expect(useCase.execute('   ')).rejects.toThrow(DomainError)
	})

	it('should be case insensitive', async () => {
		const repo = new InMemoryMusicRepository()
		const useCase = new SearchMusics(repo)

		await repo.save(createTestMusic({ id: '1', title: 'Yellow Submarine' }))

		const result = await useCase.execute('yellow')

		expect(result).toHaveLength(1)
	})
})
