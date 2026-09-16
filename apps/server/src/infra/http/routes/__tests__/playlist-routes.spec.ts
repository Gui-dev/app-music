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

describe('Playlist Routes', () => {
	describe('GET /playlists', () => {
		it('should return empty array when no playlists exist', async () => {
			const { app } = createTestApp()
			const response = await app.inject({
				method: 'GET',
				url: '/playlists',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toEqual([])
		})

		it('should return all playlists', async () => {
			const { app, playlistRepository } = createTestApp()
			await playlistRepository.create('My Playlist')
			await playlistRepository.create('Workout Mix')

			const response = await app.inject({
				method: 'GET',
				url: '/playlists',
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toHaveLength(2)
		})

		it('should return playlist with correct fields', async () => {
			const { app, playlistRepository } = createTestApp()
			await playlistRepository.create('Test Playlist')

			const response = await app.inject({
				method: 'GET',
				url: '/playlists',
			})

			const body = response.json()
			expect(body[0]).toMatchObject({
				name: 'Test Playlist',
				musicIds: [],
			})
			expect(body[0].id).toBeDefined()
			expect(body[0].createdAt).toBeDefined()
			expect(body[0].updatedAt).toBeDefined()
		})
	})

	describe('POST /playlists', () => {
		it('should create a new playlist', async () => {
			const { app } = createTestApp()

			const response = await app.inject({
				method: 'POST',
				url: '/playlists',
				payload: { name: 'New Playlist' },
			})

			expect(response.statusCode).toBe(201)
			expect(response.json()).toMatchObject({
				name: 'New Playlist',
				musicIds: [],
			})
		})

		it('should return 409 for duplicate name', async () => {
			const { app, playlistRepository } = createTestApp()
			await playlistRepository.create('Existing')

			const response = await app.inject({
				method: 'POST',
				url: '/playlists',
				payload: { name: 'Existing' },
			})

			expect(response.statusCode).toBe(409)
		})

		it('should reject empty name', async () => {
			const { app } = createTestApp()

			const response = await app.inject({
				method: 'POST',
				url: '/playlists',
				payload: { name: '' },
			})

			expect(response.statusCode).toBe(400)
		})
	})

	describe('POST /playlists/:id/add', () => {
		it('should add music to playlist', async () => {
			const { app, playlistRepository, musicRepository } = createTestApp()
			const playlist = await playlistRepository.create('My Playlist')
			await musicRepository.save(
				createTestMusic({ id: 'song1', title: 'Song 1' }),
			)

			const response = await app.inject({
				method: 'POST',
				url: `/playlists/${playlist.id}/add`,
				payload: { musicId: 'song1' },
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toEqual({ success: true })

			const updated = await playlistRepository.findById(playlist.id)
			expect(updated?.musicIds).toContain('song1')
		})

		it('should return 404 for nonexistent playlist', async () => {
			const { app } = createTestApp()

			const response = await app.inject({
				method: 'POST',
				url: '/playlists/nonexistent/add',
				payload: { musicId: 'song1' },
			})

			expect(response.statusCode).toBe(404)
		})

		it('should return 409 for duplicate music in playlist', async () => {
			const { app, playlistRepository, musicRepository } = createTestApp()
			const playlist = await playlistRepository.create('My Playlist')
			await musicRepository.save(createTestMusic({ id: 'song1' }))

			await app.inject({
				method: 'POST',
				url: `/playlists/${playlist.id}/add`,
				payload: { musicId: 'song1' },
			})

			const response = await app.inject({
				method: 'POST',
				url: `/playlists/${playlist.id}/add`,
				payload: { musicId: 'song1' },
			})

			expect(response.statusCode).toBe(409)
		})
	})

	describe('DELETE /playlists/:id/remove/:musicId', () => {
		it('should remove music from playlist', async () => {
			const { app, playlistRepository, musicRepository } = createTestApp()
			const playlist = await playlistRepository.create('My Playlist')
			await musicRepository.save(createTestMusic({ id: 'song1' }))

			await app.inject({
				method: 'POST',
				url: `/playlists/${playlist.id}/add`,
				payload: { musicId: 'song1' },
			})

			const response = await app.inject({
				method: 'DELETE',
				url: `/playlists/${playlist.id}/remove/song1`,
			})

			expect(response.statusCode).toBe(200)
			expect(response.json()).toEqual({ success: true })

			const updated = await playlistRepository.findById(playlist.id)
			expect(updated?.musicIds).not.toContain('song1')
		})

		it('should return 404 for nonexistent playlist', async () => {
			const { app } = createTestApp()

			const response = await app.inject({
				method: 'DELETE',
				url: '/playlists/nonexistent/remove/song1',
			})

			expect(response.statusCode).toBe(404)
		})

		it('should return 400 when music not in playlist', async () => {
			const { app, playlistRepository } = createTestApp()
			const playlist = await playlistRepository.create('My Playlist')

			const response = await app.inject({
				method: 'DELETE',
				url: `/playlists/${playlist.id}/remove/song1`,
			})

			expect(response.statusCode).toBe(400)
		})
	})
})
