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

describe('Music Routes', () => {
	describe('GET /music', () => {
		it('should return empty array when no musics exist', async () => {
			const { app } = createTestApp()
			const response = await app.inject({
				method: 'GET',
				url: '/music',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toEqual([])
		})

		it('should return all musics', async () => {
			const { app, musicRepository } = createTestApp()
			await musicRepository.save(createTestMusic({ id: '1', title: 'Song 1' }))
			await musicRepository.save(createTestMusic({ id: '2', title: 'Song 2' }))

			const response = await app.inject({
				method: 'GET',
				url: '/music',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toHaveLength(2)
		})

		it('should return music with all fields', async () => {
			const { app, musicRepository } = createTestApp()
			await musicRepository.save(createTestMusic())

			const response = await app.inject({
				method: 'GET',
				url: '/music',
			})

			const body = response.json()
			expect(body[0]).toEqual({
				id: '1',
				title: 'Test Song',
				artist: 'Test Artist',
				album: 'Test Album',
				duration: 180,
				coverUrl: null,
				trackNumber: 1,
				year: 2024,
			})
		})
	})

	describe('GET /music/:id', () => {
		it('should return music by id', async () => {
			const { app, musicRepository } = createTestApp()
			await musicRepository.save(
				createTestMusic({ id: 'abc', title: 'Find Me' }),
			)

			const response = await app.inject({
				method: 'GET',
				url: '/music/abc',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toMatchObject({
				id: 'abc',
				title: 'Find Me',
			})
		})

		it('should return 404 for nonexistent music', async () => {
			const { app } = createTestApp()

			const response = await app.inject({
				method: 'GET',
				url: '/music/nonexistent',
			})

			expect(response.statusCode).toBe(404)
			expect(response.json()).toEqual({ error: 'Music not found' })
		})
	})
})
