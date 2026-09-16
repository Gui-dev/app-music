import type { Music } from '@/domain/entities'
import { describe, expect, it } from 'vitest'
import { createTestApp } from './test-app'

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

describe('Search Routes', () => {
	describe('GET /search', () => {
		it('should return empty array when no matches', async () => {
			const { app } = createTestApp()

			const response = await app.inject({
				method: 'GET',
				url: '/search?q=nonexistent',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toEqual([])
		})

		it('should search by title', async () => {
			const { app, musicRepository } = createTestApp()
			await musicRepository.save(
				createTestMusic({ id: '1', title: 'Bohemian Rhapsody' }),
			)
			await musicRepository.save(
				createTestMusic({ id: '2', title: 'Stairway to Heaven' }),
			)

			const response = await app.inject({
				method: 'GET',
				url: '/search?q=bohemian',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toHaveLength(1)
			expect(response.json()[0].title).toBe('Bohemian Rhapsody')
		})

		it('should search by artist', async () => {
			const { app, musicRepository } = createTestApp()
			await musicRepository.save(
				createTestMusic({ id: '1', artist: 'Queen' }),
			)
			await musicRepository.save(
				createTestMusic({ id: '2', artist: 'Led Zeppelin' }),
			)

			const response = await app.inject({
				method: 'GET',
				url: '/search?q=queen',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toHaveLength(1)
			expect(response.json()[0].artist).toBe('Queen')
		})

		it('should search by album', async () => {
			const { app, musicRepository } = createTestApp()
			await musicRepository.save(
				createTestMusic({ id: '1', album: 'A Night at the Opera' }),
			)
			await musicRepository.save(
				createTestMusic({ id: '2', album: 'Led Zeppelin IV' }),
			)

			const response = await app.inject({
				method: 'GET',
				url: '/search?q=night',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toHaveLength(1)
			expect(response.json()[0].album).toBe('A Night at the Opera')
		})

		it('should be case insensitive', async () => {
			const { app, musicRepository } = createTestApp()
			await musicRepository.save(
				createTestMusic({ id: '1', title: 'Bohemian Rhapsody' }),
			)

			const response = await app.inject({
				method: 'GET',
				url: '/search?q=BOHEMIAN',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toHaveLength(1)
		})

		it('should return multiple matches', async () => {
			const { app, musicRepository } = createTestApp()
			await musicRepository.save(
				createTestMusic({ id: '1', title: 'The Song' }),
			)
			await musicRepository.save(
				createTestMusic({ id: '2', title: 'The Other Song' }),
			)
			await musicRepository.save(
				createTestMusic({ id: '3', title: 'Different Title' }),
			)

			const response = await app.inject({
				method: 'GET',
				url: '/search?q=the',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toHaveLength(2)
		})

		it('should require query parameter', async () => {
			const { app } = createTestApp()

			const response = await app.inject({
				method: 'GET',
				url: '/search',
			})

			expect(response.statusCode).toBe(400)
		})
	})
})
